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

    lastPingMeasurementTime = null;

    ENDPOINTS_HISTORY_STORAGE_KEY = 'endpoints.history.storage';

    constructor(browserApi, connectivity) {
        this.browserApi = browserApi;
        this.connectivity = connectivity;
        this.storage = browserApi.storage;
    }

    init = async () => {
        this.historyEndpoints = await this.storage.get(this.ENDPOINTS_HISTORY_STORAGE_KEY) || [];
    };

    arePingsFresh = () => {
        return !!(this.lastPingMeasurementTime
            && this.lastPingMeasurementTime + this.PING_TTL_MS > Date.now());
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

    * getFastestGenerator(measurePingsPromise) {
        yield measurePingsPromise;
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

    async getFastest(measurePingsPromise) {
        const { promise, cancel } = runWithCancel(
            this.getFastestGenerator.bind(this),
            measurePingsPromise
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

    getEndpoints(currentEndpointPromise, currentEndpointPingPromise) {
        if (_.isEmpty(this.endpoints)) {
            return null;
        }

        const measurePingsPromise = this.measurePings(
            currentEndpointPromise,
            currentEndpointPingPromise
        );

        const history = this.getHistory();
        const fastest = this.getFastest(measurePingsPromise);
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

        this.browserApi.runtime.sendMessage({
            type: MESSAGES_TYPES.ENDPOINTS_UPDATED,
            data: this.getAll(),
        });

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

    shouldMeasurePings() {
        if (_.isEmpty(this.endpoints)) {
            return false;
        }
        if (this.areMajorityOfPingsEmpty()) {
            return true;
        }
        return !this.arePingsFresh();
    }

    async measurePings(currentEndpointPromise, currentEndpointPingPromise) {
        if (!this.shouldMeasurePings()) {
            return;
        }

        const currentEndpoint = await currentEndpointPromise;
        const currentEndpointPing = await currentEndpointPingPromise;

        const pingPromises = Object.values(this.endpoints)
            .map(async (endpoint) => {
                const { id, domainName } = endpoint;
                let ping;

                if (currentEndpointPing && currentEndpoint.id === id) {
                    ping = currentEndpointPing;
                } else {
                    ping = await this.connectivity.endpointsPing.getPingToEndpoint(domainName);
                }

                const pingData = {
                    endpointId: id,
                    ping,
                };

                this.endpointsPings[id] = pingData;

                await this.browserApi.runtime.sendMessage({
                    type: MESSAGES_TYPES.ENDPOINTS_PING_UPDATED,
                    data: pingData,
                });

                return pingData;
            });

        await Promise.all(pingPromises);
        this.lastPingMeasurementTime = Date.now();
    }

    addToHistory = async (endpointId) => {
        if (this.historyEndpoints.includes(endpointId)) {
            this.historyEndpoints = this.historyEndpoints.filter((id) => id !== endpointId);
        }

        this.historyEndpoints.push(endpointId);
        if (this.historyEndpoints.length > this.MAX_HISTORY_LENGTH) {
            this.historyEndpoints = this.historyEndpoints.slice(-this.MAX_HISTORY_LENGTH);
        }

        await this.storage.set(this.ENDPOINTS_HISTORY_STORAGE_KEY, this.historyEndpoints);

        await this.browserApi.runtime.sendMessage({
            type: MESSAGES_TYPES.ENDPOINTS_HISTORY_UPDATED,
            data: this.getHistory(),
        });
    }
}

export default EndpointsManager;
