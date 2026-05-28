import { KoaContext } from '../routes/types';
import { getLyric } from '../services';
import { resolveRequestCookie } from '../util/cookieResolver';
import { setApiResponse, withErrorHandler } from './util';

export default withErrorHandler(async (ctx: KoaContext) => {
  const songmid = Array.isArray(ctx.query.songmid)
    ? ctx.query.songmid[0]
    : (ctx.query.songmid || ctx.params.songmid);
  const rawIsFormat = Array.isArray(ctx.query.isFormat) ? ctx.query.isFormat[0] : ctx.query.isFormat;

  if (!songmid) {
    setApiResponse(ctx, { status: 400, body: { response: 'no songmid' } });
    return;
  }

  const { cookie: effectiveCookie } = resolveRequestCookie(ctx);
  const headers: Record<string, string> = {};
  if (effectiveCookie) headers.Cookie = effectiveCookie;

  const props = {
    method: 'get',
    params: { songmid },
    option: { headers },
    isFormat: rawIsFormat,
  };

  const result = await getLyric(props);
  setApiResponse(ctx, result);
}, 'getLyric');
