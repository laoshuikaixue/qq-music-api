import { createController, validateRequired } from './util';
import { getAlbumInfo } from '../services';

export default createController(getAlbumInfo, {
  validator: validateRequired(['albummid']),
  errorMessage: 'no albummid',
  name: 'getAlbumInfo',
});
