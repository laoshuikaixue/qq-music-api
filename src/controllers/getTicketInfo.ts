import { KoaContext } from '../routes/types';
import { UCommon } from '../services';
import { setApiResponse, withErrorHandler } from './util';

export default withErrorHandler(async (ctx: KoaContext) => {
  const data = {
    comm: { ct: 24, cv: 0 },
    getFirstData: {
      module: 'mall.ticket_index_page_svr',
      method: 'GetTicketIndexPage',
      param: { city_id: -1 },
    },
    getTag: {
      module: 'mall.ticket_index_page_svr',
      method: 'GetShowTypeList',
      param: {},
    },
  };

  const params = {
    format: 'json',
    inCharset: 'utf8',
    outCharset: 'GB2312',
    platform: 'yqq.json',
    data: JSON.stringify(data),
  };

  const props = { method: 'get', params, option: {} };

  const res = await UCommon(props);
  setApiResponse(ctx, { status: 200, body: { response: res.data } });
});
