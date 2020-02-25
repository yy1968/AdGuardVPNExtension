import storage from '../../browserApi/storage';
import StatsStorage from './StatsStorage';

const statsStorage = new StatsStorage(storage);

export default statsStorage;
