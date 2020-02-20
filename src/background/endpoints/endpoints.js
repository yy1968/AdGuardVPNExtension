import EndpointsService from './EndpointsService';
import browserApi from '../browserApi';
import { proxy } from '../proxy';
import credentials from '../credentials';
import connectivity from '../connectivity';
import vpnProvider from '../providers/vpnProvider';
import storage from '../storage'; // TODO [maximtop] consider moving storage into browserApi

const endpoints = new EndpointsService(
    browserApi,
    proxy,
    credentials,
    connectivity,
    vpnProvider,
    storage
);

export default endpoints;
