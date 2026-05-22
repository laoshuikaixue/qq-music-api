import { createController, validateRequired } from '../util';
import { getSingerStarNum } from '../../module';

export default createController(getSingerStarNum, {
  validator: validateRequired(['singermid']),
  errorMessage: 'no singermid',
});
