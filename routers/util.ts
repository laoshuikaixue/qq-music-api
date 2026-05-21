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

const setInternalErrorResponse = (ctx: KoaContext, error: unknown) => {
  console.error('Controller error:', error);
  ctx.status = 500;
  ctx.body = { error: INTERNAL_ERROR_MESSAGE };
};

const isMissingRequiredValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
};

export function createController<T extends ApiOptions>(
  apiFunction: (props: T) => Promise<ApiResponse>,
  options?: ControllerOptions<Record<string, unknown>>
): Controller {
  return async (ctx: KoaContext, _next: () => Promise<void>) => {
    try {
      const params = { ...ctx.query, ...ctx.params };

      if (options?.validator) {
        const validation = options.validator(params);
        if (!validation.valid) {
          ctx.status = 400;
          ctx.body = { response: validation.error || options.errorMessage || 'Invalid parameters' };
          return;
        }
      }

      const apiProps = {
        method: 'get',
        params,
        option: {},
      } as T;

      const { status, body } = await apiFunction(apiProps);
      Object.assign(ctx, { status, body });
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

export function setApiResponse(ctx: KoaContext, apiResponse: ApiResponse): void {
  ctx.status = apiResponse.status || 500;
  ctx.body = apiResponse.body;
}

export function withErrorHandler(
  handler: (ctx: KoaContext) => Promise<void>
): (ctx: KoaContext, next: () => Promise<void>) => Promise<void> {
  return async (ctx: KoaContext, next: () => Promise<void>) => {
    try {
      await handler(ctx);
      await next();
    } catch (error) {
      console.error('Controller error:', error);
      ctx.status = 502;
      ctx.body = { error: (error as Error).message || '服务器内部错误' };
    }
  };
}
