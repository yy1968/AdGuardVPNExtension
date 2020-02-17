import EndpointsService from './EndpointsService';
import browserApi from '../browserApi';
import { proxy } from '../proxy';
import credentials from '../credentials';
import connectivity from '../connectivity/connectivity';
import vpnProvider from '../providers/vpnProvider';
import wsFactory from '../api/websocketApi';

const endpoints = new EndpointsService(
    browserApi,
    proxy,
    credentials,
    connectivity,
    vpnProvider,
    wsFactory
);

export default endpoints;
