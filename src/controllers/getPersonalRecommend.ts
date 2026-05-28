import { Context } from 'koa';
import recommendApi from '../services/apis/recommend/getPersonalRecommend';
import { resolveRequestCookie } from '../util/cookieResolver';
import { errorResponse } from '../util/apiResponse';
import { setApiResponse } from './util';

export async function getPersonalRecommendController(ctx: Context) {
	const { type = '1' } = ctx.query;
	const rawType = Array.isArray(type) ? type[0] : type;
	const { cookie } = resolveRequestCookie(ctx);
	const result = await recommendApi.getPersonalRecommend(Number(rawType), cookie);

	setApiResponse(ctx, result);
}

export async function getSimilarSongsController(ctx: Context) {
	const { songmid } = ctx.query;

	if (!songmid) {
		const result = errorResponse('缺少参数 songmid', 400);
		setApiResponse(ctx, result);
		return;
	}

	const validSongmid = Array.isArray(songmid) ? songmid[0] : songmid;
	if (!validSongmid || String(validSongmid).trim() === '') {
		const result = errorResponse('参数 songmid 不能为空', 400);
		setApiResponse(ctx, result);
		return;
	}

	const { cookie } = resolveRequestCookie(ctx);
	const result = await recommendApi.getSimilarSongs(String(validSongmid), cookie);

	setApiResponse(ctx, result);
}

export default {
	getPersonalRecommend: getPersonalRecommendController,
	getSimilarSongs: getSimilarSongsController,
};
