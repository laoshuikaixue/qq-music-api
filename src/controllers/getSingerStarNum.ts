import { createController, validateRequired } from './util';
import { getSingerStarNum } from '../services';

export default createController(getSingerStarNum, {
  validator: validateRequired(['singermid']),
  errorMessage: 'no singermid',
});
