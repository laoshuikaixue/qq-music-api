/// <reference types="vitest/globals" />

import Koa from 'koa';
import bodyParser from '../../src/middlewares/body-parser';
import router from '../../src/routes/router';
import cors from '../../src/middlewares/koa-cors';
import securityHeaders from '../../src/middlewares/security-headers';
import type { UserInfo } from '../../src/types/global';

export function createTestApp() {
	const app = new Koa();
	app.use(cors());
	app.use(securityHeaders());
	app.use(bodyParser());
	app.use(router.routes());
	app.use(router.allowedMethods());
	return app;
}

export function createTestUserInfo(): UserInfo {
	return {
		loginUin: '123456',
		cookie: 'test_cookie=123',
		cookieList: ['test_cookie=123'],
		cookieObject: { test_cookie: '123' },
		refreshData: () => {},
	};
}

interface FetchResponseOptions {
	ok?: boolean;
	text?: string;
	arrayBuffer?: Buffer;
	headers?: Record<string, string>;
	status?: number;
}

export const createFetchResponse = ({
	ok = true,
	text = '',
	arrayBuffer = Buffer.from(''),
	headers = {},
	status = 200,
}: FetchResponseOptions = {}) => ({
	ok,
	status,
	text: async () => text,
	arrayBuffer: async () => arrayBuffer,
	headers: {
		get: (name: string) => {
			const matchedKey = Object.keys(headers).find(key => key.toLowerCase() === String(name).toLowerCase());
			return matchedKey ? headers[matchedKey] : null;
		},
	},
});

type AnyRecord = Record<string, any>;

export const expectSuccessResponse = (body: AnyRecord) => {
	expect(body).toHaveProperty('response');
	expect(body).not.toHaveProperty('error');
	expect(body.response).toHaveProperty('code');
	expect(body.response).toHaveProperty('data');
};

export const expectErrorResponse = (body: AnyRecord) => {
	expect(body).toHaveProperty('error');
	expect(body).not.toHaveProperty('response');
};

export const mockGlobalFetch = () => ((global as unknown as { fetch: unknown }).fetch = vi.fn());
export const cleanupGlobalFetch = () => delete (global as unknown as { fetch?: unknown }).fetch;

export function getLatestRequestOptions(mockFn: { mock: { calls: unknown[][] } }): Record<string, unknown> {
	const latestCall = mockFn.mock.calls[mockFn.mock.calls.length - 1] || [];
	return (latestCall[0] || {}) as Record<string, unknown>;
}

export function getLatestRequestCookie(mockFn: { mock: { calls: unknown[][] } }) {
	const headers = (getLatestRequestOptions(mockFn).headers || {}) as Record<string, string>;
	return headers.Cookie || headers.cookie;
}

export function getLatestRequestPayload(mockFn: { mock: { calls: unknown[][] } }) {
	const latestOptions = getLatestRequestOptions(mockFn);
	return latestOptions.data ? JSON.parse(latestOptions.data as string) : null;
}

export type AnyMiddleware = (ctx: any, next: () => Promise<unknown>) => Promise<void>;

export type { AnyRecord };
