import { createController, validateRequired } from '../util';
import { getSingerDesc } from '../../module';

export default createController(getSingerDesc, {
  validator: validateRequired(['singermid']),
  errorMessage: 'no singermid',
});
