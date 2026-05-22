import { createController, validateRequired } from '../util';
import { getSimilarSinger } from '../../module';

export default createController(getSimilarSinger, {
  validator: validateRequired(['singermid']),
  errorMessage: 'no singermid',
});
