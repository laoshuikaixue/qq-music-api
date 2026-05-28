import { KoaContext } from '../routes/types';
import { setApiResponse, withErrorHandler } from './util';

export default withErrorHandler(async (ctx: KoaContext) => {
  const { id, size = '300x300', maxAge = 2592000 } = ctx.query;

  if (!id) {
    setApiResponse(ctx, { status: 400, body: { response: 'no id~~' } });
    return;
  }

  setApiResponse(ctx, {
    status: 200,
    body: {
      response: {
        code: 0,
        data: {
          imageUrl: `https://y.gtimg.cn/music/photo_new/T002R${size}M000${id}.jpg?max_age=${maxAge}`,
        },
      },
    },
  });
});
