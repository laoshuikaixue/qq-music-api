import { KoaContext } from '../routes/types';
import { getSearchByKey } from '../services';
import { setApiResponse, withErrorHandler } from './util';

export default withErrorHandler(async (ctx: KoaContext) => {
  const w = ctx.query.key || ctx.params.key;
  const { limit: n, page: p, catZhida, remoteplace = 'song' } = ctx.query;

  if (!w) {
    setApiResponse(ctx, { status: 400, body: { response: 'search key is null' } });
    return;
  }

  const props = {
    method: 'get',
    params: {
      w,
      n: +n || 10,
      p: +p || 1,
      catZhida: +catZhida || 1,
      remoteplace: `txt.yqq.${remoteplace}`,
    },
    option: {},
  };

  const result = await getSearchByKey(props);
  setApiResponse(ctx, result);
}, 'getSearchByKey');
