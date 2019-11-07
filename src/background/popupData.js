import vpn from './vpn';
import appStatus from './appStatus';
import log from '../lib/logger';
import { SETTINGS_IDS } from '../lib/constants';

const getPopupData = async () => {
    const isAuthenticated = await adguard.auth.isAuthenticated();
    if (!isAuthenticated) {
        return {
            isAuthenticated,
        };
    }
    const permissionsError = appStatus.getPermissionsError();
    const vpnInfo = vpn.getVpnInfo();
    const endpoints = vpn.getEndpoints();
    const selectedEndpoint = await vpn.getSelectedEndpoint();
    const canControlProxy = await adguard.appStatus.canControlProxy();
    const { value: isProxyEnabled } = adguard.settings.getSetting(SETTINGS_IDS.PROXY_ENABLED);
    return {
        permissionsError,
        vpnInfo,
        endpoints,
        selectedEndpoint,
        isAuthenticated,
        canControlProxy,
        isProxyEnabled,
    };
};

const sleep = waitTime => new Promise((resolve) => {
    setTimeout(resolve, waitTime);
});

let retryCounter = 0;
const getPopupDataRetry = async (retryNum = 1, retryDelay = 100) => {
    const backoffIndex = 1.5;
    const data = await getPopupData();
    retryCounter += 1;
    if (!data.isAuthenticated || data.permissionsError) {
        retryCounter = 0;
        return data;
    }
    const { vpnInfo, endpoints, selectedEndpoint } = data;
    if (!vpnInfo || !endpoints || !selectedEndpoint) {
        if (retryNum <= 1) {
            throw new Error(`Unable to get data in ${retryCounter} retries`);
        }
        await sleep(retryDelay);
        log.debug(`Retry get popup data again retry: ${retryCounter}`);
        return getPopupDataRetry(retryNum - 1, retryDelay * backoffIndex);
    }
    retryCounter = 0;
    return data;
};

export default { getPopupData, getPopupDataRetry };
