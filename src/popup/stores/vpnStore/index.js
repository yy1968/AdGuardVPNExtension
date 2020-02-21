import {
    action, computed, observable, runInAction, toJS,
} from 'mobx';
import { REQUEST_STATUSES } from '../consts';

class VpnStore {
    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @observable endpoints = {};

    @observable pings = {};

    @observable _fastestEndpoints;

    @observable gettingFastestStatus;

    @observable endpointsGetState;

    @observable selectedEndpoint;

    @observable searchValue = '';

    @observable vpnInfo = {
        bandwidthFreeMbits: null,
        premiumPromoEnabled: null,
        premiumPromoPage: null,
        totalTraffic: null,
        remainingTraffic: null,
    };

    @action
    setSearchValue = (value) => {
        const trimmed = value.trim();
        if (trimmed !== this.searchValue) {
            this.searchValue = value;
        }
    };

    @action
    setEndpoints = (endpoints) => {
        if (!endpoints) {
            return;
        }
        this.endpoints = endpoints;
    };

    @action
    setHistoryEndpoints = (endpoints) => {
        if (!endpoints) {
            return;
        }
        this.endpoints.history = endpoints;
    };

    @action
    setPing = (endpointPing) => {
        this.pings[endpointPing.endpointId] = endpointPing;
    };

    @action
    selectEndpoint = async (id) => {
        const selectedEndpoint = this.endpoints?.all?.[id];
        if (!selectedEndpoint) {
            throw new Error(`No endpoint with id: "${id}" found`);
        }
        await adguard.proxy.setCurrentEndpoint(toJS(selectedEndpoint));
        await adguard.endpoints.addToHistory(selectedEndpoint.id);
        runInAction(() => {
            this.selectedEndpoint = selectedEndpoint;
        });
    };

    @action
    setSelectedEndpoint = (endpoint) => {
        if (!endpoint) {
            return;
        }
        if (!this.selectedEndpoint
            || (this.selectedEndpoint && this.selectedEndpoint.id !== endpoint.id)) {
            this.selectedEndpoint = endpoint;
        }
    };

    @computed
    get filteredEndpoints() {
        const allEndpoints = Object.values(this.endpoints?.all || {});

        return allEndpoints
            .filter((endpoint) => {
                if (!this.searchValue || this.searchValue.length === 0) {
                    return true;
                }
                const regex = new RegExp(this.searchValue, 'ig');
                return (endpoint.cityName && endpoint.cityName.match(regex))
                || (endpoint.countryName && endpoint.countryName.match(regex));
            })
            .map((endpoint) => {
                if (this.selectedEndpoint && this.selectedEndpoint.id === endpoint.id) {
                    return { ...endpoint, selected: true };
                }
                return endpoint;
            })
            .map((endpoint) => {
                const endpointPing = this.pings[endpoint.id];
                if (endpointPing) {
                    return { ...endpoint, ping: endpointPing.ping };
                }
                return endpoint;
            });
    }

    async requestFastestEndpoints() {
        const fastestPromise = this.endpoints?.fastest;
        if (!fastestPromise) {
            throw new Error('No promise received');
        }
        this.gettingFastestStatus = REQUEST_STATUSES.PENDING;
        const fastestEndpoints = await fastestPromise;
        runInAction(() => {
            this._fastestEndpoints = fastestEndpoints;
            this.gettingFastestStatus = REQUEST_STATUSES.DONE;
        });
    }

    @computed
    get fastestEndpoints() {
        return Object.values(this._fastestEndpoints || {})
            .sort((a, b) => a.ping - b.ping);
    }

    @computed
    get historyEndpoints() {
        return Object.values(this.endpoints?.history || {})
            .sort((a, b) => b.order - a.order)
            .map((endpoint) => {
                const endpointPing = this.pings[endpoint.id];
                if (endpointPing) {
                    return { ...endpoint, ping: endpointPing.ping };
                }
                return endpoint;
            });
    }

    @computed
    get countryNameToDisplay() {
        return this.selectedEndpoint && this.selectedEndpoint.countryName;
    }

    @computed
    get countryCodeToDisplay() {
        return this.selectedEndpoint && this.selectedEndpoint.countryCode;
    }

    @computed
    get cityNameToDisplay() {
        return this.selectedEndpoint && this.selectedEndpoint.cityName;
    }

    @action
    setVpnInfo = (vpnInfo) => {
        if (!vpnInfo) {
            return;
        }
        this.vpnInfo = vpnInfo;
    };

    @computed
    get bandwidthFreeMbits() {
        return this.vpnInfo.bandwidthFreeMbits;
    }

    @computed
    get premiumPromoEnabled() {
        return this.vpnInfo.premiumPromoEnabled;
    }

    @computed
    get premiumPromoPage() {
        return this.vpnInfo.premiumPromoPage;
    }

    @computed
    get totalTraffic() {
        return this.vpnInfo.totalTraffic;
    }

    @computed
    get remainingTraffic() {
        return this.vpnInfo.remainingTraffic;
    }

    @computed
    get insufficientTraffic() {
        return this.vpnInfo.remainingTraffic <= 0;
    }
}

export default VpnStore;
