import { Context, Next } from 'koa';

export interface CorsOptions {
  origin?: string | string[] | ((ctx: Context) => string);
  exposeHeaders?: string[];
  maxAge?: number;
  credentials?: boolean;
  allowMethods?: string[];
  allowHeaders?: string[];
}

function resolveOrigin(ctx: Context, options: CorsOptions): string {
  const requestOrigin = ctx.get('Origin');

  if (typeof options.origin === 'function') {
    return options.origin(ctx);
  }

  if (Array.isArray(options.origin)) {
    return requestOrigin && options.origin.includes(requestOrigin) ? requestOrigin : '';
  }

  return options.origin || requestOrigin || '*';
}

function crossOrigin(options: CorsOptions = {}) {
  const defaultOptions: CorsOptions = {
    allowMethods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  };

  options = Object.assign({}, defaultOptions, options);

  return async function cors(ctx: Context, next: Next) {
    ctx.vary('Origin');

    const origin = resolveOrigin(ctx, options);

    if (!origin) {
      return await next();
    }

    ctx.set('Access-Control-Allow-Origin', origin);

    if (ctx.method === 'OPTIONS') {
      if (!ctx.get('Access-Control-Request-Method')) {
        return await next();
      }

      if (options.maxAge) {
        ctx.set('Access-Control-Max-Age', String(options.maxAge));
      }

      if (options.credentials === true && origin !== '*') {
        ctx.set('Access-Control-Allow-Credentials', 'true');
      }

      if (options.allowMethods) {
        ctx.set('Access-Control-Allow-Methods', options.allowMethods.join(','));
      }

      if (options.allowHeaders) {
        ctx.set('Access-Control-Allow-Headers', options.allowHeaders.join(','));
      } else {
        ctx.set('Access-Control-Allow-Headers', ctx.get('Access-Control-Request-Headers'));
      }

      ctx.status = 204;
    } else {
      if (options.credentials === true && origin !== '*') {
        ctx.set('Access-Control-Allow-Credentials', 'true');
      }

      if (options.exposeHeaders) {
        ctx.set('Access-Control-Expose-Headers', options.exposeHeaders.join(','));
      }

      try {
        await next();
      } catch (err) {
        throw err;
      }
    }
  };
}

export default crossOrigin;
