import { KoaContext } from '../routes/types';
import { getSingerMv } from '../services';
import { setApiResponse, withErrorHandler } from './util';

export default withErrorHandler(async (ctx: KoaContext) => {
  const { singermid, order, num = 5 } = ctx.query;

  if (!singermid) {
    setApiResponse(ctx, { status: 400, body: { response: 'no singermid' } });
    return;
  }

  const orderStr = Array.isArray(order) ? order[0] : order;
  const params: Record<string, any> = { singermid, order: orderStr, num };

  if (orderStr && orderStr.toLowerCase() === 'time') {
    params.cmd = 1;
  }

  const props = { method: 'get', params, option: {} };
  const result = await getSingerMv(props);
  setApiResponse(ctx, result);
});
