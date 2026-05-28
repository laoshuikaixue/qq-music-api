import { createController, validateRequired } from './util';
import { getSimilarSinger } from '../services';

export default createController(getSimilarSinger, {
  validator: validateRequired(['singermid']),
  errorMessage: 'no singermid',
});
