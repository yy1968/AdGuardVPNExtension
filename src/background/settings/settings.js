import SettingsService from './SettingsService';
import storage from '../storage';
import log from '../../lib/logger';
import notifier from '../../lib/notifier';
import { SETTINGS_IDS } from '../../lib/constants';
import switcher from '../switcher';

const DEFAULT_SETTINGS = {
    [SETTINGS_IDS.PROXY_ENABLED]: false,
    [SETTINGS_IDS.RATE_SHOW]: true,
    [SETTINGS_IDS.EXCLUSIONS]: {},
};

const settingsService = new SettingsService(storage, DEFAULT_SETTINGS);

const switcherHandler = (value) => {
    if (value) {
        switcher.turnOn();
    } else {
        switcher.turnOff();
    }
};

const getHandler = (settingId) => {
    switch (settingId) {
        case SETTINGS_IDS.PROXY_ENABLED: {
            return switcherHandler;
        }
        default:
            return () => {};
    }
};

// TODO [maximtop] check all locations where function was run
const setSetting = (id, value, force) => {
    const setting = settingsService.getSetting(id);

    // No need to change same value unless is not force set
    if (setting === value && !force) {
        return false;
    }

    const handler = getHandler(id);
    if (handler) {
        try {
            handler(value);
        } catch (e) {
            log.error(e.message);
            return false;
        }
    } else {
        log.warn('There is no handler with id:', id);
        return false;
    }

    notifier.notifyListeners(notifier.types.SETTING_UPDATED, id, value);
    settingsService.setSetting(id, value);
    log.info(`Setting with id: "${id}" was set to: "${value}"`);
    return true;
};

const disableProxy = () => {
    setSetting(SETTINGS_IDS.PROXY_ENABLED, false);
};

const isProxyEnabled = () => {
    const setting = settingsService.getSetting(SETTINGS_IDS.PROXY_ENABLED);
    return setting === true;
};

const applySettings = async () => {
    try {
        switcherHandler(isProxyEnabled());
    } catch (e) {
        disableProxy();
    }
    log.info('Settings were applied');
};

const init = async () => {
    await settingsService.init();
    log.info('Settings module is ready');
};

const getSetting = (id) => {
    return settingsService.getSetting(id);
};

const getExclusions = () => {
    return settingsService.getSetting(SETTINGS_IDS.EXCLUSIONS) || {};
};

const setExclusions = (exclusions) => {
    settingsService.setSetting(SETTINGS_IDS.EXCLUSIONS, exclusions);
};

const settings = {
    init,
    getSetting,
    setSetting,
    disableProxy,
    isProxyEnabled,
    SETTINGS_IDS,
    settingsService,
    applySettings,
    getExclusions,
    setExclusions,
};

export default settings;
