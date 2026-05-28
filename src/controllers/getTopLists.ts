import { createController } from './util';
import { getTopLists } from '../services';

export default createController(getTopLists);
