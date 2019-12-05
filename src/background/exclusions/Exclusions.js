import EXCLUSIONS_TYPES from './exclusionsTypes';
import ExclusionsHandler from './ExclusionsHandler';
import log from '../../lib/logger';
import { MESSAGES_TYPES } from '../../lib/constants';

class Exclusions {
    TYPES = {
        WHITELIST: 'whitelist',
        BLACKLIST: 'blacklist',
    };

    constructor(browser, proxy, settings) {
        this.browser = browser;
        this.proxy = proxy;
        this.settings = settings;
    }

    init = async () => {
        this.exclusions = this.settings.getExclusions() || {};

        const whitelist = this.exclusions?.[EXCLUSIONS_TYPES.WHITELIST] ?? {};
        const blacklist = this.exclusions?.[EXCLUSIONS_TYPES.BLACKLIST] ?? {};

        this.__inverted = this.exclusions?.inverted ?? 'false';

        this.__whitelistHandler = new ExclusionsHandler(
            this.handleExclusionsUpdate,
            whitelist,
            EXCLUSIONS_TYPES.WHITELIST
        );

        this.__blacklistHandler = new ExclusionsHandler(
            this.handleExclusionsUpdate,
            blacklist,
            EXCLUSIONS_TYPES.BLACKLIST
        );

        this.__currentHandler = this.__inverted ? this.__whitelistHandler : this.__blacklistHandler;
        // update bypass list in proxy on init
        await this.handleExclusionsUpdate();
        log.info('ExclusionsHandler list is ready');
    };

    handleExclusionsUpdate = async (exclusion) => {
        if (exclusion) {
            this.browser.runtime.sendMessage({
                type: MESSAGES_TYPES.EXCLUSION_UPDATED,
                data: { exclusion },
            });
        }

        const enabledExclusions = this.current.getExclusionsList()
            .filter(({ enabled }) => enabled)
            .map(({ hostname }) => hostname);

        await this.proxy.setBypassList(enabledExclusions, this.__inverted);

        const exclusions = {
            inverted: this.__inverted,
            [this.TYPES.WHITELIST]: this.whitelist.exclusions,
            [this.TYPES.BLACKLIST]: this.blacklist.exclusions,
        };

        this.settings.setExclusions(exclusions);
    };

    async setCurrentHandler(type) {
        switch (type) {
            case EXCLUSIONS_TYPES.WHITELIST: {
                this.__currentHandler = this.__whitelistHandler;
                this.__inverted = true;
                break;
            }
            case EXCLUSIONS_TYPES.BLACKLIST: {
                this.__currentHandler = this.__blacklistHandler;
                this.__inverted = false;
                break;
            }
            default:
                throw Error(`Wrong type received ${type}`);
        }
        await this.handleExclusionsUpdate();
    }

    getHandler(type) {
        switch (type) {
            case this.TYPES.WHITELIST: {
                return this.whitelist;
            }
            case this.TYPES.BLACKLIST: {
                return this.blacklist;
            }
            default:
                throw Error(`Wrong type requested: ${type}`);
        }
    }

    get whitelist() {
        return this.__whitelistHandler;
    }

    get blacklist() {
        return this.__blacklistHandler;
    }

    get current() {
        return this.__currentHandler;
    }

    isInverted() {
        return this.__inverted;
    }
}

export default Exclusions;
