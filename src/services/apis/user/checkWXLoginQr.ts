import type { ApiFunction, ApiOptions, ApiResponse } from '../../../types/api';
import { customResponse, errorResponse } from '../../../util/apiResponse';
import { buildLoginSession, fetchWithTimeout } from '../../../util/loginUtils';
import { extractEncryptedUin } from './checkQQLoginQr';

const WX_LOGIN_APPID = 'wx48db31d50e334801';
const WX_POLL_TIMEOUT_MS = 35000;
const WX_STATUS_RE = /window\.wx_errcode=(\d+);window\.wx_code='([^']*)'/;

// 微信区 musicid 超出 Number.MAX_SAFE_INTEGER，JSON.parse 会截断末位；
// 必须从原始响应文本中按字符串形态提取
const WX_MUSICID_RES = [
	/"strMusicid"\s*:\s*"(\d+)"/,
	/"musicid"\s*:\s*(\d+)/,
];

const extractMusicIdText = (rawText: string): string => {
	for (const pattern of WX_MUSICID_RES) {
		const match = rawText.match(pattern);
		if (match?.[1]) {
			return match[1];
		}
	}
	return '';
};

const pollWXQrStatus = async (
	uuid: string,
): Promise<{ errcode: string; code: string; timeout?: boolean }> => {
	const url = `https://lp.open.weixin.qq.com/connect/l/qrconnect?uuid=${encodeURIComponent(uuid)}&_=${Date.now()}`;

	try {
		const response = await fetchWithTimeout(
			url,
			{ headers: { Referer: 'https://open.weixin.qq.com/' } },
			WX_POLL_TIMEOUT_MS,
		);
		const text = (await response.text()) || '';
		const match = text.match(WX_STATUS_RE);
		if (!match) {
			throw new Error('invalid status payload');
		}
		return { errcode: match[1], code: match[2] };
	} catch (error) {
		if ((error as Error).name === 'AbortError' || (error as Error).name === 'TimeoutError') {
			// 长轮询等待期超时属常态空转：无事件即按未扫码继续，timeout 供调用方区分
			return { errcode: '408', code: '', timeout: true };
		}
		throw error;
	}
};

const exchangeWXCodeForSession = async (
	code: string,
): Promise<{ session: ReturnType<typeof buildLoginSession>; message: string }> => {
	const payload = JSON.stringify({
		comm: {
			tmeLoginType: 1,
			ct: 24,
			cv: 0,
			platform: 'yqq',
		},
		req: {
			module: 'music.login.LoginServer',
			method: 'Login',
			param: { code, strAppid: WX_LOGIN_APPID },
		},
	});

	const response = await fetchWithTimeout('https://u.y.qq.com/cgi-bin/musicu.fcg', {
		method: 'POST',
		body: payload,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Referer: 'https://y.qq.com/',
		},
	});
	const loginText = (await response.text()) || '';

	let parsed: any;
	try {
		parsed = JSON.parse(loginText);
	} catch {
		throw new Error('login response is not json');
	}

	if (Number(parsed?.code) !== 0 || Number(parsed?.req?.code) !== 0) {
		throw new Error(`login failed with code ${parsed?.req?.code ?? parsed?.code}`);
	}

	const data = parsed.req.data || {};
	const musicid = extractMusicIdText(loginText);
	const musickey = String(data.musickey ?? '');
	if (!musicid || !musickey) {
		throw new Error('login response missing credential');
	}

	const cookiePairs: string[] = [
		`uin=${musicid}`,
		`qqmusic_uin=${musicid}`,
		`qqmusic_key=${musickey}`,
		`qm_keyst=${musickey}`,
		`tmeLoginType=${String(data.loginType ?? 1)}`,
	];
	if (data.encryptUin) {
		cookiePairs.push(`euin=${data.encryptUin}`);
	}
	if (data.openid) {
		cookiePairs.push(`wx_openid=${data.openid}`);
	}
	if (data.unionid) {
		cookiePairs.push(`wx_unionid=${data.unionid}`);
	}

	const cookie = cookiePairs.join('; ');
	const baseSession = buildLoginSession(cookie);
	const euin = data.encryptUin || extractEncryptedUin(loginText);

	return {
		session: { ...baseSession, ...(euin ? { euin } : {}) },
		message: '登录成功',
	};
};

// 微信开放平台二维码状态码：405 确认完成 / 404 已扫码待确认 / 403 用户取消 / 402 已过期 / 408 未扫描
const checkWXLoginQr: ApiFunction = async ({ params = {} }: ApiOptions): Promise<ApiResponse> => {
	const uuid = (params as Record<string, unknown>).uuid ? String((params as Record<string, unknown>).uuid) : '';
	if (!uuid) {
		return errorResponse('参数错误', 400);
	}

	try {
		const { errcode, code, timeout } = await pollWXQrStatus(uuid);

		if (errcode === '405' && code) {
			const { session, message } = await exchangeWXCodeForSession(code);
			return customResponse({ isOk: true, message, session }, 200);
		}

		if (errcode === '402') {
			return customResponse({ isOk: false, refresh: true, message: '二维码已失效' }, 200);
		}
		if (errcode === '403') {
			return customResponse({ isOk: false, refresh: true, refused: true, message: '已取消登录' }, 200);
		}
		if (errcode === '404') {
			return customResponse({ isOk: false, scanned: true, message: '已扫描，等待确认' }, 200);
		}
		return customResponse(
			timeout
				? { isOk: false, timeout: true, message: '本轮等待超时，请稍后重试' }
				: { isOk: false, message: '未扫描二维码' },
			200,
		);
	} catch (error) {
		const err = error as Error;
		// 凭证交换阶段的网络级超时与 QQ 流程保持同一语义（504）
		if (err?.name === 'AbortError' || err?.name === 'TimeoutError') {
			return errorResponse('登录检查超时', 504);
		}
		return errorResponse(err?.message || '登录检查失败', 502);
	}
};

export default checkWXLoginQr;
