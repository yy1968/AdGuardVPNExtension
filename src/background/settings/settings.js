import SettingsService from './SettingsService';
import storage from '../storage';
import log from '../../lib/logger';
import notifier from '../../lib/notifier';
import { proxy } from '../proxy';
import credentials from '../credentials';
import connectivity from '../connectivity/connectivity';
import { SETTINGS_IDS } from '../../lib/constants';
import actions from '../actions';

const DEFAULT_SETTINGS = {
    [SETTINGS_IDS.PROXY_ENABLED]: false,
    [SETTINGS_IDS.RATE_SHOW]: true,
    [SETTINGS_IDS.EXCLUSIONS]: {},
};

const settingsService = new SettingsService(storage, DEFAULT_SETTINGS);

const proxyEnabledHandler = async (value) => {
    if (value) {
        try {
            const accessPrefix = await credentials.getAccessPrefix();
            const { host, domainName } = await proxy.setAccessPrefix(accessPrefix);
            const vpnToken = await credentials.gainVpnToken();
            await connectivity.setCredentials(host, domainName, vpnToken.token);
            await proxy.turnOn();
            await actions.setIconEnabled();
        } catch (e) {
            log.error(e.message);
            throw e;
        }
    } else {
        connectivity.stop();
        await proxy.turnOff();
        await actions.setIconDisabled();
    }
};

const getHandler = (settingId) => {
    switch (settingId) {
        case SETTINGS_IDS.PROXY_ENABLED: {
            return proxyEnabledHandler;
        }
        default:
            return () => {};
    }
};

const setSetting = async (id, value, force) => {
    const setting = settingsService.getSetting(id);
    // No need to change same value unless is not force set
    if (setting === value && !force) {
        return false;
    }
    const handler = getHandler(id);
    if (handler) {
        try {
            await handler(value);
        } catch (e) {
            log.error(e.message);
            return false;
        }
    } else {
        log.error('There is no handler with id:', id);
        return false;
    }

    notifier.notifyListeners(notifier.types.SETTING_UPDATED, id, value);
    settingsService.setSetting(id, value);
    log.info(`Setting with id: "${id}" was set to: "${value}"`);
    return true;
};

const disableProxy = async () => {
    await setSetting(SETTINGS_IDS.PROXY_ENABLED, false);
};

const isProxyEnabled = () => {
    const setting = settingsService.getSetting(SETTINGS_IDS.PROXY_ENABLED);
    return setting === true;
};

const init = async () => {
    return settingsService.init();
};

const getSetting = async (id) => {
    return settingsService.getSetting(id);
};

const settings = {
    init,
    getSetting,
    setSetting,
    disableProxy,
    isProxyEnabled,
    SETTINGS_IDS,
    settingsService,
};

export default settings;
