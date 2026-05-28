import { Context } from 'koa';
import recommendApi from '../services/apis/recommend/getDailyRecommend';
import { resolveRequestCookie } from '../util/cookieResolver';
import { setApiResponse } from './util';

export async function getDailyRecommendController(ctx: Context) {
	const { cookie } = resolveRequestCookie(ctx);
	const result = await recommendApi.getDailyRecommend(cookie);

	setApiResponse(ctx, result);
}

export async function getPrivateFMController(ctx: Context) {
	const { cookie } = resolveRequestCookie(ctx);
	const result = await recommendApi.getPrivateFM(cookie);

	setApiResponse(ctx, result);
}

export async function getNewSongsController(ctx: Context) {
	const { areaId = '5', limit = '20' } = ctx.query;
	const result = await recommendApi.getNewSongs(Number(areaId), Number(limit));

	setApiResponse(ctx, result);
}

export default {
	getDailyRecommend: getDailyRecommendController,
	getPrivateFM: getPrivateFMController,
	getNewSongs: getNewSongsController,
};
