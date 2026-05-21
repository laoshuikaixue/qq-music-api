import type { Middleware } from 'koa';

const METHODS = new Set(['POST', 'PUT', 'PATCH']);
const JSON_BODY_LIMIT = 1024 * 1024;
const FORM_BODY_LIMIT = 56 * 1024;

const getBodyLimit = (contentType: string) =>
	contentType.includes('application/x-www-form-urlencoded') ? FORM_BODY_LIMIT : JSON_BODY_LIMIT;

const parseUrlEncoded = (raw: string) => {
	const body: Record<string, string | string[]> = {};
	const params = new URLSearchParams(raw);

	params.forEach((value, key) => {
		const current = body[key];
		if (current === undefined) {
			body[key] = value;
		} else if (Array.isArray(current)) {
			current.push(value);
		} else {
			body[key] = [current, value];
		}
	});

	return body;
};

const bodyParser = (): Middleware => async (ctx, next) => {
	if (!METHODS.has(ctx.method)) return await next();

	const contentType = ctx.get('Content-Type') || '';
	const bodyLimit = getBodyLimit(contentType);
	const buffers: Buffer[] = [];
	let bodySize = 0;

	for await (const chunk of ctx.req) {
		const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
		bodySize += buffer.byteLength;
		if (bodySize > bodyLimit) ctx.throw(413, 'Request body too large');
		buffers.push(buffer);
	}

	if (buffers.length === 0) return await next();

	const raw = Buffer.concat(buffers).toString('utf-8');

	try {
		if (contentType.includes('application/json')) {
			ctx.request.body = JSON.parse(raw);
		} else if (contentType.includes('application/x-www-form-urlencoded')) {
			ctx.request.body = parseUrlEncoded(raw);
		} else {
			ctx.request.body = raw;
		}
	} catch {
		ctx.throw(400, 'Invalid JSON in request body');
	}

	await next();
};

export default bodyParser;
