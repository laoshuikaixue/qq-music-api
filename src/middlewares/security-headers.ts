import type { Middleware } from 'koa';

const securityHeaders = (): Middleware => async (ctx, next) => {
	ctx.set('X-Content-Type-Options', 'nosniff');
	ctx.set('X-Frame-Options', 'DENY');
	ctx.set('Referrer-Policy', 'no-referrer');

	await next();
};

export default securityHeaders;
