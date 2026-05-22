import { KoaContext } from '../types';
import { getUserPlaylists } from '../../module';
import { resolveRequestCookie } from '../../util/cookieResolver';
import { setApiResponse, withErrorHandler } from '../util';

export default withErrorHandler(async (ctx: KoaContext) => {
  const { uin, offset = 0, limit = 30 } = ctx.query;

  if (!uin) {
    setApiResponse(ctx, { status: 400, body: { error: '缺少 uin 参数' } });
    return;
  }

  const normalizedUin = Array.isArray(uin) ? uin[0] : uin;
  const { cookie } = resolveRequestCookie(ctx);

  const result = await getUserPlaylists({
    uin: String(normalizedUin),
    offset: Number(offset),
    limit: Number(limit),
    cookie,
  });

  setApiResponse(ctx, result);
});
