import browser from 'webextension-polyfill';
import Exclusions from './exclusions';
import { proxy } from '../proxy';
import storage from '../storage';

const exclusions = new Exclusions(browser, proxy, storage);

export default exclusions;
