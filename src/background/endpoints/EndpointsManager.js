import _ from 'lodash';
import { MESSAGES_TYPES } from '../../lib/constants';
import { identity, runWithCancel } from '../../lib/helpers';
import log from '../../lib/logger';

class EndpointsManager {
    endpoints = {};

    endpointsPings = {}; // { endpointId, ping }[]

    historyEndpoints = [];

    MAX_HISTORY_LENGTH = 3;

    MAX_FASTEST_LENGTH = 4;

    PING_TTL_MS = 1000 * 60 * 2; // 2 minutes

    lastPingDetermination = null;

    ENDPOINTS_HISTORY_STORAGE_KEY = 'endpoints.history.storage';

    constructor(browserApi, connectivity, storage) {
        this.browserApi = browserApi;
        this.connectivity = connectivity;
        this.storage = storage;
    }

    init = async () => {
        this.historyEndpoints = await this.storage.get(this.ENDPOINTS_HISTORY_STORAGE_KEY) || [];
    };

    arePingsFresh = () => {
        return !!(this.lastPingDetermination
            && this.lastPingDetermination + this.PING_TTL_MS > Date.now());
    };

    arrToObjConverter = (acc, endpoint) => {
        acc[endpoint.id] = endpoint;
        return acc;
    };

    getHistory() {
        return this.historyEndpoints
            .map((id, idx) => {
                return { ...this.endpoints[id], order: idx };
            })
            .filter(identity)
            .map(this.enrichWithPing)
            .reduce(this.arrToObjConverter, {});
    }

    * getFastestGenerator(determinePingsPromise) {
        yield determinePingsPromise;
        const sortedPings = _.sortBy(Object.values(this.endpointsPings), ['ping']);
        const fastest = sortedPings
            .map(({ endpointId }) => {
                return this.endpoints[endpointId];
            })
            .filter(identity)
            .slice(0, this.MAX_FASTEST_LENGTH)
            .map(this.enrichWithPing)
            .reduce(this.arrToObjConverter, {});
        return fastest;
    }

    async getFastest(determinePingsPromise) {
        const { promise, cancel } = runWithCancel(
            this.getFastestGenerator.bind(this),
            determinePingsPromise
        );

        this.fastestCancel = cancel;
        return promise
            .catch((e) => log.warn(e.reason));
    }

    cancelGetFastest(reason) {
        if (this.fastestCancel) {
            this.fastestCancel(reason);
        }
    }

    enrichWithPing = (endpoint) => {
        if (!this.arePingsFresh()) {
            return endpoint;
        }

        const endpointsPing = this.endpointsPings[endpoint.id];

        return endpointsPing ? { ...endpoint, ping: endpointsPing.ping } : endpoint;
    };

    getAll = () => {
        return Object.values(this.endpoints)
            .map(this.enrichWithPing)
            .reduce(this.arrToObjConverter, {});
    };

    getEndpoints() {
        if (_.isEmpty(this.endpoints)) {
            return null;
        }

        const determinePingsPromise = this.determinePings();
        const history = this.getHistory();
        const fastest = this.getFastest(determinePingsPromise);
        const all = this.getAll();

        return {
            history,
            fastest,
            all,
        };
    }

    setEndpoints(endpoints) {
        if (_.isEqual(this.endpoints, endpoints)) {
            return this.endpoints;
        }

        this.endpoints = endpoints;

        // TODO [maximtop] consider how to update correctly
        // this.browserApi.runtime.sendMessage({
        //     type: MESSAGES_TYPES.ENDPOINTS_UPDATED,
        //     data: this.getEndpoints(),
        // });

        return this.endpoints;
    }

    /**
     * This function is useful to recheck pings after internet connection being turned off
     * @returns {boolean}
     */
    areMajorityOfPingsEmpty() {
        const endpointsPings = Object.values(this.endpointsPings);
        const undefinedPings = endpointsPings
            .filter((endpointPing) => endpointPing.ping === undefined);

        if (undefinedPings.length > Math.ceil(endpointsPings.length / 2)) {
            return true;
        }

        return false;
    }

    shouldDeterminePings() {
        return _.isEmpty(this.endpoints) || !this.arePingsFresh()
            || this.areMajorityOfPingsEmpty();
    }

    async determinePings() {
        if (!this.shouldDeterminePings()) {
            return;
        }

        const pingPromises = Object.values(this.endpoints)
            .map(async (endpoint) => {
                const { id, domainName } = endpoint;
                const ping = await this.connectivity.endpointsPing.getPingToEndpoint(domainName);

                const pingData = {
                    endpointId: id,
                    ping,
                };

                this.endpointsPings[id] = pingData;

                await this.browserApi.runtime.sendMessage({
                    type: MESSAGES_TYPES.ENDPOINTS_PING_UPDATED,
                    data: pingData,
                });
            });

        await Promise.all(pingPromises);
        this.lastPingDetermination = Date.now();
    }

    addToHistory = async (endpointId) => {
        if (this.historyEndpoints[this.historyEndpoints.length - 1] === endpointId) {
            return;
        }

        this.historyEndpoints.push(endpointId);
        if (this.historyEndpoints.length > this.MAX_HISTORY_LENGTH) {
            this.historyEndpoints = this.historyEndpoints.slice(-this.MAX_HISTORY_LENGTH);
        }

        this.storage.set(this.ENDPOINTS_HISTORY_STORAGE_KEY, this.historyEndpoints);

        await this.browserApi.runtime.sendMessage({
            type: MESSAGES_TYPES.ENDPOINTS_HISTORY_UPDATED,
            data: this.getHistory(),
        });
    }
}

export default EndpointsManager;
