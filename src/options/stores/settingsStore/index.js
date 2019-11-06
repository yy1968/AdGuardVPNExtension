import {
    action,
    computed,
    observable,
    runInAction,
} from 'mobx';

import tabs from '../../../background/tabs';
import log from '../../../lib/logger';
import { getHostname, formatBytes } from '../../../lib/helpers';
import { SETTINGS_IDS } from '../../../lib/constants';
import { REQUEST_STATUSES } from '../consts';

// TODO remove unused
class SettingsStore {
    @observable switcherEnabled = false;

    @observable proxyEnabled = false;

    @observable proxyEnablingStatus = REQUEST_STATUSES.DONE;

    @observable canControlProxy = false;

    @observable gettingEndpointsState;

    @observable isExcluded;

    @observable currentTabHostname;

    @observable proxyStats;

    @observable ping = 0;

    @observable isRoutable = true;

    @observable globalError;

    @observable exclusions;

    @observable exclusionsInput = '';

    @observable isFormVisible = false;

    @observable isRateVisible = true;

    @observable appVersion;

    @observable currentUsername;

    // New actions
    @action
    getExclusions = () => {
        this.exclusions = adguard.exclusions.getExclusions();
    };

    @action
    removeFromExclusions = async (hostName) => {
        try {
            await adguard.exclusions.removeFromExclusions(hostName);
        } catch (e) {
            log.error(e);
        }
    };

    @action
    toggleExclusion = async (id) => {
        try {
            await adguard.exclusions.toggleExclusion(id);
        } catch (e) {
            log.error(e);
        }
    };

    @action
    addToExclusions = async () => {
        try {
            await adguard.exclusions.addToExclusions(this.exclusionsInput);
            runInAction(() => {
                this.isFormVisible = false;
                this.exclusionInput = '';
            });
        } catch (e) {
            log.error(e);
        }
    };

    @action
    onExclusionsInputChange = (value) => {
        this.exclusionsInput = value;
    };

    @action
    toggleExclusionsForm = () => {
        this.isFormVisible = !this.isFormVisible;
    };

    @action
    getVersion = () => {
        this.appVersion = adguard.appStatus.version;
    };

    @action
    getUsername = async () => {
        const username = await adguard.credentials.getUsername();

        runInAction(() => {
            this.currentUsername = username;
        });
    };

    @action
    checkRateStatus = async () => {
        const { value } = await adguard.settings.getSetting(SETTINGS_IDS.RATE_SHOW);
        runInAction(() => {
            this.isRateVisible = value;
        });
    }

    @action
    hideRate = async () => {
        await adguard.settings.setSetting(SETTINGS_IDS.RATE_SHOW, false);
        runInAction(() => {
            this.isRateVisible = false;
        });
    };

    // Old actions
    @action
    getProxyPing = () => {
        this.ping = adguard.connectivity.getPing();
    };

    @action
    async checkProxyControl() {
        const { canControlProxy } = await adguard.appStatus.canControlProxy();
        runInAction(() => {
            this.canControlProxy = canControlProxy;
        });
    }

    @action
    enableSwitcher = () => {
        this.switcherEnabled = true;
    };

    @action
    disableSwitcher = () => {
        this.switcherEnabled = false;
    };

    toggleSwitcher = (value) => {
        if (this.switcherEnabled !== value) {
            if (value) {
                this.enableSwitcher();
            } else {
                this.disableSwitcher();
            }
            return true;
        }
        return false;
    };

    @action
    async getGlobalProxyEnabled() {
        const { value } = adguard.settings.getSetting(SETTINGS_IDS.PROXY_ENABLED);
        runInAction(() => {
            this.proxyEnabled = value;
            this.toggleSwitcher(value);
        });
    }

    @action
    enableProxy = async () => {
        const flag = true;
        this.proxyEnablingStatus = REQUEST_STATUSES.PENDING;
        const changed = await adguard.settings.setSetting(SETTINGS_IDS.PROXY_ENABLED, flag);
        runInAction(() => {
            this.proxyEnablingStatus = REQUEST_STATUSES.DONE;
        });
        if (changed) {
            this.getProxyPing();
            await this.getProxyStats();
            runInAction(() => {
                this.proxyEnabled = flag;
            });
        }
        return changed;
    };

    @action
    disableProxy = async () => {
        const flag = false;
        const changed = await adguard.settings.setSetting(SETTINGS_IDS.PROXY_ENABLED, flag);
        runInAction(() => {
            this.proxyEnabled = flag;
        });
        return changed;
    };

    @action
    setProxyEnabled = (value) => {
        this.proxyEnabled = value;
    };

    @action
    setProxyState = async (value) => {
        let changed;
        const switched = this.toggleSwitcher(value);
        try {
            if (value) {
                changed = await this.enableProxy();
            } else {
                changed = await this.disableProxy();
            }
        } catch (e) {
            log.error(e.message);
            if (switched) {
                this.toggleSwitcher(!value);
            }
            return;
        }
        if (!changed && switched) {
            this.toggleSwitcher(!value);
        }
    };

    @action
    checkIsExcluded = async () => {
        try {
            await this.getCurrentTabHostname();
            const result = adguard.exclusions.isExcluded(this.currentTabHostname);
            runInAction(() => {
                this.isExcluded = result;
            });
        } catch (e) {
            log.error(e);
        }
    };

    @action
    getCurrentTabHostname = async () => {
        try {
            const result = await tabs.getCurrent();
            runInAction(() => {
                this.currentTabHostname = getHostname(result.url);
            });
        } catch (e) {
            log.error(e);
        }
    };

    @action
    getProxyStats = async () => {
        const stats = await adguard.connectivity.getStats();
        runInAction(() => {
            this.proxyStats = stats;
        });
    };

    @action
    isTabRoutable = async () => {
        try {
            const currentTab = await tabs.getCurrent();
            const isRoutable = adguard.tabsContext.isTabRoutable(currentTab.id);
            runInAction(() => {
                this.isRoutable = isRoutable;
            });
        } catch (e) {
            log.error(e);
        }
    };

    @computed
    get stats() {
        let { bytesDownloaded, bytesUploaded } = this.proxyEnabled ? this.proxyStats || {} : {};
        bytesDownloaded = formatBytes(bytesDownloaded);
        bytesUploaded = formatBytes(bytesUploaded);
        return { bytesDownloaded, bytesUploaded };
    }

    @action
    setGlobalError = (data) => {
        this.globalError = data;
    }

    @computed
    get proxyIsEnabling() {
        return this.proxyEnablingStatus === REQUEST_STATUSES.PENDING;
    }
}

export default SettingsStore;