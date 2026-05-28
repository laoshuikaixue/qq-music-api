import { KoaContext } from '../routes/types';
import { getSmartbox } from '../services';
import { setApiResponse, withErrorHandler } from './util';

export default withErrorHandler(async (ctx: KoaContext) => {
  const { key } = ctx.query;

  if (!key) {
    setApiResponse(ctx, { status: 200, body: { response: null } });
    return;
  }

  const props = {
    method: 'get',
    params: { key },
    option: {},
  };

  const result = await getSmartbox(props);
  setApiResponse(ctx, result);
});
