import * as locator from './serviceLocator';
import Credentials from './Credentials';
import browserApi from './browserApi';
import vpnProvider from './providers/vpnProvider';
import permissionsError from './permissionsChecker/permissionsError';
import { proxy } from './proxy';
import PermissionsChecker from './permissionsChecker/PermissionsChecker';
import PopupData from './PopupData';
import nonRoutable from './routability/nonRoutable';
import EndpointsService from './endpoints/EndpointsService';
import connectivity from './connectivity';
import auth from './auth';

export default function configureServices() {
    const credentials = new Credentials({
        browserApi,
        permissionsError,
        proxy,
        vpnProvider,
        auth,
    });

    const permissionsChecker = new PermissionsChecker({
        credentials,
        permissionsError,
    });

    const endpoints = new EndpointsService({
        browserApi,
        connectivity,
        credentials,
        proxy,
        vpnProvider,
    });

    const popupData = new PopupData({
        endpoints,
        nonRoutable,
        permissionsChecker,
        permissionsError,
    });

    locator.initialize({
        credentials,
        endpoints,
        permissionsChecker,
        popupData,
    });
}
