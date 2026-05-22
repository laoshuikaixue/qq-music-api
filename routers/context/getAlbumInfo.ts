import { createController, validateRequired } from '../util';
import { getAlbumInfo } from '../../module';

export default createController(getAlbumInfo, {
  validator: validateRequired(['albummid']),
  errorMessage: 'no albummid',
});
