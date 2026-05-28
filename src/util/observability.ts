import type { KoaContext } from '../routes/types';
import type { ApiResponse } from '../types/api';
import { logger } from './logger';

type ServiceLogPayload = Record<string, unknown>;

const now = () => Date.now();

export const startTimer = (): (() => number) => {
	const startedAt = now();
	return () => now() - startedAt;
};

export const logControllerStart = (name: string, ctx: KoaContext) => {
	logger.debug(`[controller:${name}] start`, {
		method: ctx.method,
		path: ctx.path,
		query: ctx.query,
		params: ctx.params,
	});
};

export const logControllerSuccess = (name: string, ctx: KoaContext, durationMs: number) => {
	logger.info(`[controller:${name}] success`, {
		status: ctx.status,
		durationMs,
	});
};

export const logControllerFailure = (name: string, error: unknown, durationMs: number) => {
	logger.error(`[controller:${name}] failure`, {
		durationMs,
		error: error instanceof Error ? { name: error.name, message: error.message } : error,
	});
};

export const logServiceRequest = (name: string, payload?: ServiceLogPayload) => {
	logger.debug(`[service:${name}] request`, payload);
};

export const logServiceSuccess = (name: string, response: ApiResponse, durationMs: number) => {
	logger.debug(`[service:${name}] success`, {
		status: response.status,
		durationMs,
	});
};

export const logServiceFailure = (name: string, error: unknown, durationMs: number) => {
	logger.warn(`[service:${name}] failure`, {
		durationMs,
		error: error instanceof Error ? { name: error.name, message: error.message } : error,
	});
};

export const observeService = async <T extends ApiResponse>(
	name: string,
	payload: ServiceLogPayload | undefined,
	callback: () => Promise<T>,
): Promise<T> => {
	const duration = startTimer();
	logServiceRequest(name, payload);

	try {
		const response = await callback();
		logServiceSuccess(name, response, duration());
		return response;
	} catch (error) {
		logServiceFailure(name, error, duration());
		throw error;
	}
};
