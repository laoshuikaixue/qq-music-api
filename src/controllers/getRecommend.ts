import { KoaContext } from '../routes/types';
import { UCommon } from '../services';
import { setApiResponse, withErrorHandler } from './util';

export default withErrorHandler(async (ctx: KoaContext) => {
  const data = {
    comm: { ct: 24 },
    category: {
      method: 'get_hot_category',
      param: { qq: '' },
      module: 'music.web_category_svr',
    },
    recomPlaylist: {
      method: 'get_hot_recommend',
      param: { async: 1, cmd: 2 },
      module: 'playlist.HotRecommendServer',
    },
    playlist: {
      method: 'get_playlist_by_category',
      param: { id: 8, curPage: 1, size: 40, order: 5, titleid: 8 },
      module: 'playlist.PlayListPlazaServer',
    },
    new_song: {
      module: 'newsong.NewSongServer',
      method: 'get_new_song_info',
      param: { type: 5 },
    },
    new_album: {
      module: 'newalbum.NewAlbumServer',
      method: 'get_new_album_info',
      param: { area: 1, sin: 0, num: 10 },
    },
    new_album_tag: {
      module: 'newalbum.NewAlbumServer',
      method: 'get_new_album_area',
      param: {},
    },
    toplist: {
      module: 'musicToplist.ToplistInfoServer',
      method: 'GetAll',
      param: {},
    },
    focus: {
      module: 'QQMusic.MusichallServer',
      method: 'GetFocus',
      param: {},
    },
  };

  const params = { format: 'json', data: JSON.stringify(data) };
  const props = { method: 'get', params, option: {} };

  const res = await UCommon(props);
  setApiResponse(ctx, { status: 200, body: { response: res.data } });
});
