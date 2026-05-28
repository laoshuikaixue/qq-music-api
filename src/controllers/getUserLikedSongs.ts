import { KoaContext } from '../routes/types';
import { getUserLikedSongs } from '../services';
import { setApiResponse, withErrorHandler } from './util';

export default withErrorHandler(async (ctx: KoaContext) => {
  const { uin, offset = 0, limit = 30 } = ctx.query;

  if (!uin) {
    setApiResponse(ctx, { status: 400, body: { error: '缺少 uin 参数' } });
    return;
  }

  const result = await getUserLikedSongs({
    uin: uin as string,
    offset: Number(offset),
    limit: Number(limit),
  });

  setApiResponse(ctx, result);
});
