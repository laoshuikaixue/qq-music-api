import type { ApiFunction, ApiOptions } from '../../../types/api';
import { customResponse, errorResponse } from '../../../util/apiResponse';
import { fetchWithTimeout } from '../../../util/loginUtils';

// QQ 音乐网页版官方微信开放平台 AppID，redirect 指向官方 wx_redirect 页
const WX_LOGIN_APPID = 'wx48db31d50e334801';
const WX_REDIRECT_URI =
	'https://y.qq.com/portal/wx_redirect.html?login_type=2&surl=https://y.qq.com/';

const WX_UUID_RES = [
	// 当前线上页面将 uuid 直接输出在二维码图片路径中
	/connect\/qrcode\/([\w=-]{8,})/,
	// JSON 键值形态
	/"uuid"\s*:\s*"([\w=-]{8,})"/,
	// JS 变量赋值形态（lookbehind 排除 authorize_uuid 等）
	/(?<![a-zA-Z_])uuid\s*=\s*"([\w=-]{8,})"/,
	// 历史 url 直拼形态
	/uuid=([\w=-]{8,})["'&;\s]/,
];

const extractWXUuid = (html: string): string | undefined => {
	for (const pattern of WX_UUID_RES) {
		const match = html.match(pattern);
		if (match?.[1]) {
			return match[1];
		}
	}
	return undefined;
};

const getWXLoginQr: ApiFunction = async (_props: ApiOptions) => {
	try {
		const redirectUri = encodeURIComponent(WX_REDIRECT_URI);
		const pageUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${WX_LOGIN_APPID}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=qqmusic`;

		const pageResponse = await fetchWithTimeout(pageUrl, {
			headers: {
				Referer: 'https://y.qq.com/',
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
			},
		});
		if (!pageResponse.ok) {
			return errorResponse('Failed to load WeChat login page', 502);
		}
		const uuid = extractWXUuid(await pageResponse.text());
		if (!uuid) {
			return errorResponse('Failed to get uuid from WeChat login page', 502);
		}

		const imgResponse = await fetchWithTimeout(
			`https://open.weixin.qq.com/connect/qrcode/${uuid}`,
			{
				headers: { Referer: 'https://open.weixin.qq.com/connect/qrconnect' },
			},
		);
		if (!imgResponse.ok) {
			return errorResponse('Failed to fetch WeChat QR image', 502);
		}
		const data = await imgResponse.arrayBuffer();
		const img = `data:image/jpeg;base64,${Buffer.from(data).toString('base64')}`;

		return customResponse({ img, uuid }, 200);
	} catch {
		return errorResponse('Failed to fetch WeChat login QR', 502);
	}
};

export default getWXLoginQr;
