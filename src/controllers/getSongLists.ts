import { KoaContext } from '../routes/types';
import { songLists } from '../services';
import { setApiResponse, withErrorHandler } from './util';

export default withErrorHandler(async (ctx: KoaContext) => {
  const { limit = 20, page = 0, sortId = 5, categoryId = 10000000 } = ctx.query;
  const sin = +page * +limit;
  const ein = +limit * (+page + 1) - 1;

  const props = {
    method: 'get',
    params: { categoryId, sortId, sin, ein },
    option: {},
  };

  const result = await songLists(props);
  setApiResponse(ctx, result);
});
