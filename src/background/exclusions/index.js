import Exclusions from './exclusions';
import { proxy } from '../proxy';
import storage from '../storage';

const exclusions = new Exclusions(proxy, storage);

export default exclusions;
