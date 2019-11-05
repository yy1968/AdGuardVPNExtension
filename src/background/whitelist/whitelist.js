import browser from 'webextension-polyfill';
import { getHostname } from '../../lib/helpers';
import log from '../../lib/logger';
import { MESSAGES_TYPES } from '../../lib/constants';

export default class Whitelist {
    constructor(proxy, storage) {
        this.proxy = proxy;
        this.storage = storage;
    }

    static get WHITELIST_KEY() {
        return 'whitelist.storage.key';
    }

    init = async () => {
        let whitelistedList;
        try {
            whitelistedList = await this.storage.get(Whitelist.WHITELIST_KEY);
        } catch (e) {
            log.error(e.message);
            throw e;
        }

        this.whitelisted = whitelistedList || [];
        await this.handleWhitelistUpdate();
        log.info('Whitelist is ready');
    };

    handleWhitelistUpdate = async () => {
        await this.proxy.setBypassWhitelist(this.whitelisted);
        await this.storage.set(Whitelist.WHITELIST_KEY, this.whitelisted);
    };

    addToWhitelist = async (url) => {
        const hostname = getHostname(url);

        if (!hostname || (hostname && this.whitelisted.includes(hostname))) {
            return;
        }

        this.whitelisted.push(hostname);
        await this.handleWhitelistUpdate();
        browser.runtime.sendMessage({ type: MESSAGES_TYPES.EXCLUSION_ADDED, data: hostname });
    };

    removeFromWhitelist = async (url) => {
        const hostname = getHostname(url);
        if (!hostname || (hostname && !this.whitelisted.includes(hostname))) {
            return;
        }
        this.whitelisted = this.whitelisted
            .filter(hostname => hostname !== getHostname(url));
        await this.handleWhitelistUpdate();
        browser.runtime.sendMessage({ type: MESSAGES_TYPES.EXCLUSION_REMOVED, data: hostname });
    };

    isWhitelisted = (url) => {
        const hostname = getHostname(url);
        if (hostname) {
            return this.whitelisted.includes(hostname);
        }
        return false;
    };

    getExclusions = () => {
        return this.whitelisted;
    }
}
