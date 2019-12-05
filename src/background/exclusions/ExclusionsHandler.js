import nanoid from 'nanoid';
import { getHostname } from '../../lib/helpers';

export default class ExclusionsHandler {
    constructor(updateHandler, exclusions, type) {
        this.updateHandler = updateHandler;
        this.__exclusions = exclusions;
        this.__type = type;
    }

    get type() {
        return this.__type;
    }

    handleExclusionsUpdate = (exclusion) => {
        if (exclusion) {
            this.updateHandler(this.__type, this.__exclusions, exclusion);
        } else {
            this.updateHandler(this.__type, this.__exclusions);
        }
    };

    addToExclusions = async (url) => {
        const hostname = getHostname(url);

        if (!hostname) {
            return;
        }

        // check if exclusion existed
        let exclusion = Object.values(this.__exclusions).find((exclusion) => {
            return exclusion.hostname === hostname;
        });

        // if it was disabled, enable, otherwise add the new one
        if (exclusion) {
            if (!exclusion.enabled) {
                this.__exclusions[exclusion.id] = { ...exclusion, enabled: true };
            }
        } else {
            const id = nanoid();
            exclusion = { id, hostname, enabled: true };
            this.__exclusions[id] = exclusion;
        }

        await this.handleExclusionsUpdate(exclusion);
    };

    removeFromExclusions = async (id) => {
        const exclusion = this.__exclusions[id];
        if (!exclusion) {
            return;
        }
        delete this.__exclusions[id];

        await this.handleExclusionsUpdate(exclusion);
    };

    removeFromExclusionsByHostname = async (hostname) => {
        const exclusion = Object.values(this.__exclusions).find((val) => {
            return val.hostname === hostname;
        });

        delete this.__exclusions[exclusion.id];

        await this.handleExclusionsUpdate(exclusion);
    };

    isExcluded = (url) => {
        const hostname = getHostname(url);
        if (hostname) {
            const exclusion = Object.values(this.__exclusions)
                .find(exclusion => exclusion.hostname === hostname);
            return !!(exclusion && exclusion.enabled);
        }
        return false;
    };

    toggleExclusion = async (id) => {
        let exclusion = this.__exclusions[id];
        if (!exclusion) {
            return;
        }

        exclusion = { ...exclusion, enabled: !exclusion.enabled };
        this.__exclusions[id] = exclusion;
        await this.handleExclusionsUpdate(exclusion);
    };

    renameExclusion = async (id, newUrl) => {
        const hostname = getHostname(newUrl);
        if (!hostname) {
            return;
        }
        const exclusion = this.__exclusions[id];
        if (!exclusion) {
            return;
        }
        this.__exclusions[id] = { ...exclusion, hostname };
        await this.handleExclusionsUpdate();
    };

    clearExclusions = async () => {
        this.__exclusions = {};
        await this.handleExclusionsUpdate();
    };

    get exclusions() {
        return this.__exclusions;
    }

    getExclusionsList = () => {
        return Object.values(this.__exclusions);
    };
}
