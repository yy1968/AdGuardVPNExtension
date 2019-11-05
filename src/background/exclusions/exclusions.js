import browser from 'webextension-polyfill';
import { getHostname } from '../../lib/helpers';
import log from '../../lib/logger';
import { MESSAGES_TYPES } from '../../lib/constants';

export default class Exclusions {
    constructor(proxy, storage) {
        this.proxy = proxy;
        this.storage = storage;
    }

    static get EXCLUSIONS_KEY() {
        return 'exclusions.storage.key';
    }

    init = async () => {
        let exclusionsList;
        try {
            exclusionsList = await this.storage.get(Exclusions.EXCLUSIONS_KEY);
        } catch (e) {
            log.error(e.message);
            throw e;
        }

        this.exclusions = exclusionsList || [];
        await this.handleExclusionsUpdate();
        log.info('Exclusions is ready');
    };

    handleExclusionsUpdate = async () => {
        await this.proxy.setBypassList(this.exclusions);
        await this.storage.set(Exclusions.EXCLUSIONS_KEY, this.exclusions);
    };

    addToExclusions = async (url) => {
        const hostname = getHostname(url);

        if (!hostname || (hostname && this.exclusions.includes(hostname))) {
            return;
        }

        this.exclusions.push(hostname);
        await this.handleExclusionsUpdate();
        browser.runtime.sendMessage({ type: MESSAGES_TYPES.EXCLUSION_ADDED, data: hostname });
    };

    removeFromExclusions = async (url) => {
        const hostname = getHostname(url);
        if (!hostname || (hostname && !this.exclusions.includes(hostname))) {
            return;
        }
        this.exclusions = this.exclusions
            .filter(hostname => hostname !== getHostname(url));
        await this.handleExclusionsUpdate();
        browser.runtime.sendMessage({ type: MESSAGES_TYPES.EXCLUSION_REMOVED, data: hostname });
    };

    isExcluded = (url) => {
        const hostname = getHostname(url);
        if (hostname) {
            return this.exclusions.includes(hostname);
        }
        return false;
    };

    getExclusions = () => {
        return this.exclusions;
    }
}
