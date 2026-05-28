import { createController, validateRequired } from './util';
import { getSingerDesc } from '../services';

export default createController(getSingerDesc, {
  validator: validateRequired(['singermid']),
  errorMessage: 'no singermid',
});
