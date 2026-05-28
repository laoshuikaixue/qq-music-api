import { KoaContext } from '../routes/types';
import { UCommon } from '../services';
import { setApiResponse, withErrorHandler } from './util';

export default withErrorHandler(async (ctx: KoaContext) => {
  const page = +ctx.query.page || 1;
  const num = +ctx.query.limit || 20;
  const start = (page - 1) * num;

  const data: any = {
    new_album: {
      module: 'newalbum.NewAlbumServer',
      method: 'get_new_album_info',
      param: { area: 1, start, num },
    },
    comm: { ct: 24, cv: 0 },
  };

  if (!start) {
    data.new_album_tag = {
      module: 'newalbum.NewAlbumServer',
      method: 'get_new_album_area',
      param: {},
    };
  }

  const params = { format: 'json', data: JSON.stringify(data) };
  const props = { method: 'get', params, option: {} };

  const res = await UCommon(props);
  setApiResponse(ctx, { status: 200, body: { response: res.data } });
});
