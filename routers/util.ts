import type { Context } from 'koa';
import type { KoaContext, Controller } from './types';
import type { ApiResponse, ApiOptions } from '../types/api';

export interface Validator<T = Record<string, unknown>> {
	(params: T): { valid: boolean; error?: string };
}

export interface ControllerOptions<T = Record<string, unknown>> {
	validator?: Validator<T>;
	errorMessage?: string;
	onError?: (ctx: KoaContext, error: unknown) => void;
}

const INTERNAL_ERROR_MESSAGE = '服务器内部错误';
const UPSTREAM_ERROR_MESSAGE = '上游服务异常';

const setJsonResponse = (ctx: Context, status: number, body: unknown) => {
	ctx.status = status;
	ctx.type = 'application/json';
	ctx.body = body;
};

const setInternalErrorResponse = (ctx: KoaContext, error: unknown) => {
	console.error('Controller error:', error);
	setJsonResponse(ctx, 500, { error: INTERNAL_ERROR_MESSAGE });
};

const isMissingRequiredValue = (value: unknown): boolean => {
	if (value === undefined || value === null) return true;
	if (typeof value === 'string') return value.trim() === '';
	return false;
};

export function createController<T extends ApiOptions>(
	apiFunction: (props: T) => Promise<ApiResponse>,
	options?: ControllerOptions<Record<string, unknown>>,
): Controller {
	return async (ctx: KoaContext, _next: () => Promise<void>) => {
		try {
			const params = { ...ctx.query, ...ctx.params };

			if (options?.validator) {
				const validation = options.validator(params);
				if (!validation.valid) {
					setJsonResponse(ctx, 400, { response: validation.error || options.errorMessage || 'Invalid parameters' });
					return;
				}
			}

			const apiProps = {
				method: 'get',
				params,
				option: {},
			} as T;

			const { status, body } = await apiFunction(apiProps);
			setJsonResponse(ctx, status, body);
		} catch (error) {
			if (options?.onError) {
				options.onError(ctx, error);
			} else {
				setInternalErrorResponse(ctx, error);
			}
		}
	};
}

export function validateRequired(fields: string[]): Validator {
	return (params: Record<string, unknown>) => {
		const missingFields = fields.filter(field => isMissingRequiredValue(params[field]));
		if (missingFields.length > 0) {
			return { valid: false, error: `缺少必需参数：${missingFields.join(', ')}` };
		}
		return { valid: true };
	};
}

export function setApiResponse(ctx: Context, apiResponse: ApiResponse): void {
	setJsonResponse(ctx, apiResponse.status || 500, apiResponse.body);
}

export function withErrorHandler(
	handler: (ctx: KoaContext) => Promise<void>,
): (ctx: KoaContext, next: () => Promise<void>) => Promise<void> {
	return async (ctx: KoaContext, next: () => Promise<void>) => {
		try {
			await handler(ctx);
			await next();
		} catch (error) {
			console.error('Controller error:', error);
			setJsonResponse(ctx, 502, { error: UPSTREAM_ERROR_MESSAGE });
		}
	};
}
