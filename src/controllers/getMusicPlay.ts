import { KoaContext } from '../routes/types';
import { getMusicPlay } from '../services';
import { resolveRequestCookie } from '../util/cookieResolver';
import { setApiResponse, withErrorHandler } from './util';

export default withErrorHandler(async (ctx: KoaContext) => {
  const songmid = ctx.query.songmid ?? ctx.params.songmid;
  const resType = Array.isArray(ctx.query.resType) ? ctx.query.resType[0] : ctx.query.resType;
  const mediaId = Array.isArray(ctx.query.mediaId) ? ctx.query.mediaId[0] : ctx.query.mediaId;
  const quality = Array.isArray(ctx.query.quality) ? ctx.query.quality[0] : ctx.query.quality;

  const { cookie: effectiveCookie } = resolveRequestCookie(ctx);
  const headers: Record<string, string> = {};
  if (effectiveCookie) headers.Cookie = effectiveCookie;

  const props = {
    method: 'get',
    params: { songmid, resType, mediaId, quality },
    option: { headers },
  };

  const result = await getMusicPlay(props);
  setApiResponse(ctx, result);
});
