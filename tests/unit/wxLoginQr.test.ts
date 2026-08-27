import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import checkWXLoginQr from '../../src/services/apis/user/checkWXLoginQr';
import getWXLoginQr from '../../src/services/apis/user/getWXLoginQr';

const jsonResponse = (payload: unknown, status = 200) =>
	({
		ok: status < 400,
		status,
		text: async () => JSON.stringify(payload),
		arrayBuffer: async () => new ArrayBuffer(0),
		headers: { get: () => null },
	}) as unknown as Response;

const textResponse = (text: string, status = 200) =>
	({
		ok: status < 400,
		status,
		text: async () => text,
		arrayBuffer: async () => new ArrayBuffer(0),
		headers: { get: () => null },
	}) as unknown as Response;

describe('wx login qr services', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => {
				throw new Error('unexpected fetch call');
			}),
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	test('getWXLoginQr extracts uuid and returns base64 image', async () => {
		const fetchMock = vi.mocked(globalThis.fetch);
		fetchMock
			.mockResolvedValueOnce(
				textResponse('<img class="js_qrcode_img" src="/connect/qrcode/abc123==" data-uuid>'),
			)
			.mockResolvedValueOnce(jsonResponse({}, 200));

		const result = await getWXLoginQr({ params: {} });

		expect(result.status).toBe(200);
		const body = result.body as any;
		expect(body.uuid).toBe('abc123==');
		expect((body.img as string).startsWith('data:image/jpeg;base64,')).toBe(true);
	});

	test('getWXLoginQr falls back to quoted assignment for uuid', async () => {
		const fetchMock = vi.mocked(globalThis.fetch);
		fetchMock
			.mockResolvedValueOnce(textResponse('window.wxData = {"code":0,"uuid":"fallbackuuid"};'))
			.mockResolvedValueOnce(jsonResponse({}, 200));

		const result = await getWXLoginQr({ params: {} });

		expect(result.status).toBe(200);
		expect((result.body as any).uuid as string).toBe('fallbackuuid');
	});

	test('getWXLoginQr fails when uuid is missing', async () => {
		const fetchMock = vi.mocked(globalThis.fetch);
		fetchMock.mockResolvedValueOnce(textResponse('no uuid here', 200));

		const result = await getWXLoginQr({ params: {} });

		expect(result.status).toBe(502);
		expect((result.body as any).error).toBeTruthy();
	});

	test('checkWXLoginQr exchanges confirmed code for music session', async () => {
		const fetchMock = vi.mocked(globalThis.fetch);
		fetchMock
			.mockResolvedValueOnce(textResponse("window.wx_errcode=405;window.wx_code='wxcodedata';"))
			.mockResolvedValueOnce(
				jsonResponse({
					code: 0,
					req: {
						code: 0,
						data: {
							musicid: 3048087505,
							musickey: 'W_Xtest_musickey',
							encryptUin: 'v02encrypted',
							loginType: 1,
						},
					},
				}),
			);

		const result = await checkWXLoginQr({ params: { uuid: 'uuid-1' } });

		expect(result.status).toBe(200);
		const body = result.body as any;
		expect(body.isOk).toBe(true);

		const sessionCookie = body.session.cookie as string;
		expect(sessionCookie).toContain('uin=3048087505');
		expect(sessionCookie).toContain('qm_keyst=W_Xtest_musickey');
		expect(sessionCookie).toContain('qqmusic_key=W_Xtest_musickey');
		expect(sessionCookie).toContain('euin=v02encrypted');
		expect(sessionCookie).toContain('tmeLoginType=1');
		expect(body.session.euin).toBe('v02encrypted');
	});

	test('checkWXLoginQr reports expired QR for errcode 402', async () => {
		const fetchMock = vi.mocked(globalThis.fetch);
		fetchMock.mockResolvedValueOnce(textResponse("window.wx_errcode=402;window.wx_code='';"));

		const result = await checkWXLoginQr({ params: { uuid: 'uuid-2' } });

		expect(result.status).toBe(200);
		const body = result.body as any;
		expect(body.isOk).toBe(false);
		expect(body.refresh).toBe(true);
	});

	test('checkWXLoginQr reports scanned state for errcode 404', async () => {
		const fetchMock = vi.mocked(globalThis.fetch);
		fetchMock.mockResolvedValueOnce(textResponse("window.wx_errcode=404;window.wx_code='';"));

		const result = await checkWXLoginQr({ params: { uuid: 'uuid-3' } });

		const body = result.body as any;
		expect(body.isOk).toBe(false);
		expect(body.scanned).toBe(true);
	});

	test('checkWXLoginQr rejects missing uuid', async () => {
		const result = await checkWXLoginQr({ params: {} });

		expect(result.status).toBe(400);
	});
});
