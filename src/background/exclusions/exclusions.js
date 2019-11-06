import nanoid from 'nanoid';
import { getHostname } from '../../lib/helpers';
import log from '../../lib/logger';
import { MESSAGES_TYPES } from '../../lib/constants';

export default class Exclusions {
    constructor(browser, proxy, storage) {
        this.browser = browser;
        this.proxy = proxy;
        this.storage = storage;
    }

    SCHEME_VERSION = 1;

    static get EXCLUSIONS_KEY() {
        return 'exclusions.storage.key';
    }

    init = async () => {
        let exclusionsFromStorage;
        try {
            exclusionsFromStorage = await this.storage.get(Exclusions.EXCLUSIONS_KEY);
        } catch (e) {
            log.error(e.message);
            throw e;
        }

        if (!exclusionsFromStorage) {
            this.exclusions = {};
        } else if (exclusionsFromStorage && exclusionsFromStorage.version !== this.SCHEME_VERSION) {
            log.warn(`expected scheme version ${this.SCHEME_VERSION} and got ${exclusionsFromStorage.version}`);
            // here you can another scheme converters logic, for now we use the default
            this.exclusions = {};
        } else {
            this.exclusions = exclusionsFromStorage.exclusions;
        }

        await this.handleExclusionsUpdate();
        log.info('Exclusions are ready');
    };

    handleExclusionsUpdate = async (exclusion) => {
        if (exclusion) {
            this.browser.runtime.sendMessage({
                type: MESSAGES_TYPES.EXCLUSION_UPDATED,
                data: { exclusion },
            });
        }
        const enabledExclusions = Object.values(this.exclusions)
            .filter(({ enabled }) => enabled)
            .map(({ hostname }) => hostname);
        await this.proxy.setBypassList(enabledExclusions);
        await this.storage.set(Exclusions.EXCLUSIONS_KEY, {
            version: this.SCHEME_VERSION,
            exclusions: this.exclusions,
        });
    };

    addToExclusions = async (url) => {
        const hostname = getHostname(url);

        if (!hostname) {
            return;
        }

        // if was disabled, then enable
        let exclusion = Object.values(this.exclusions).find((exclusion) => {
            return exclusion.hostname === hostname;
        });

        if (exclusion) {
            if (!exclusion.enabled) {
                this.exclusions[exclusion.id] = true;
            }
        } else {
            const id = nanoid();
            exclusion = { id, hostname, enabled: true };
            this.exclusions[id] = exclusion;
        }

        await this.handleExclusionsUpdate(exclusion);
    };

    removeFromExclusions = async (id) => {
        const exclusion = this.exclusions[id];
        if (!exclusion) {
            return;
        }

        delete this.exclusions[id];

        await this.handleExclusionsUpdate(exclusion);
    };

    isExcluded = (url) => {
        const hostname = getHostname(url);
        if (hostname) {
            const exclusion = Object.values(this.exclusions)
                .find(exclusion => exclusion.hostname === hostname);
            return !!(exclusion && exclusion.enabled);
        }
        return false;
    };

    toggleExclusion = async (id) => {
        let exclusion = this.exclusions[id];
        if (!exclusion) {
            return;
        }

        exclusion = { ...exclusion, enabled: !exclusion.enabled };
        this.exclusions[id] = exclusion;
        await this.handleExclusionsUpdate(exclusion);
    };

    renameExclusion = async (id, newUrl) => {
        const hostname = getHostname(newUrl);
        if (!hostname) {
            return;
        }
        const exclusion = this.exclusions[id];
        if (!exclusion) {
            return;
        }
        this.exclusions[id] = { ...exclusion, hostname };
        await this.handleExclusionsUpdate();
    };

    clearExclusions = async () => {
        this.exclusions = {};
        await this.handleExclusionsUpdate();
    };

    getExclusions = () => {
        return Object.values(this.exclusions);
    };
}
