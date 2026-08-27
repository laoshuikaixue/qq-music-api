import { Controller } from '../routes/types';
import { checkWXLoginQr } from '../services';
import { setApiResponse } from './util';

const controller: Controller = async (ctx, _next) => {
	const body = ctx.request.body || {};
	const uuid = (ctx.query.uuid as string) || (body as Record<string, unknown>).uuid;

	const props = {
		method: 'post',
		option: {},
		params: { uuid },
	};

	const { status, body: responseBody } = await checkWXLoginQr(props);
	setApiResponse(ctx, { status: status || 500, body: responseBody });
};

export default controller;
