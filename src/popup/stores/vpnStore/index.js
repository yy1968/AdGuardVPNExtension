import {
    action,
    computed,
    observable,
    runInAction,
    toJS,
} from 'mobx';
import { REQUEST_STATUSES } from '../consts';

const MAX_FASTEST_LENGTH = 3;

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
        maxDownloadedBytes: null,
        usedDownloadedBytes: null,
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
        this.requestFastestEndpoints();
    };

    @action
    setAllEndpoints = (endpoints) => {
        if (!endpoints) {
            return;
        }
        this.endpoints.all = endpoints;
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
            this.selectedEndpoint = { ...selectedEndpoint, selected: true };
        });
    };

    @action
    setSelectedEndpoint = (endpoint) => {
        if (!endpoint) {
            return;
        }
        if (!this.selectedEndpoint
            || (this.selectedEndpoint && this.selectedEndpoint.id !== endpoint.id)) {
            this.selectedEndpoint = { ...endpoint, selected: true };
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
            .sort((a, b) => {
                if (a.countryName < b.countryName) {
                    return -1;
                }
                if (a.countryName > b.countryName) {
                    return 1;
                }
                return 0;
            })
            .map((endpoint) => {
                const endpointPing = this.pings[endpoint.id];
                if (endpointPing) {
                    return { ...endpoint, ping: endpointPing.ping };
                }
                return endpoint;
            });
    }

    @action
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
            .filter((endpoint) => this.selectedEndpoint && this.selectedEndpoint.id !== endpoint.id)
            .sort((a, b) => a.ping - b.ping)
            .slice(0, MAX_FASTEST_LENGTH);
    }

    @computed
    get historyEndpoints() {
        return Object.values(this.endpoints?.history || {})
            .filter((endpoint) => this.selectedEndpoint && this.selectedEndpoint.id !== endpoint.id)
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
    get remainingTraffic() {
        return this.vpnInfo.maxDownloadedBytes - this.vpnInfo.usedDownloadedBytes;
    }

    @computed
    get insufficientTraffic() {
        return this.remainingTraffic <= 0;
    }

    @computed
    get trafficUsingProgress() {
        const { maxDownloadedBytes } = this.vpnInfo;
        return Math.floor((this.remainingTraffic / maxDownloadedBytes) * 100);
    }

    @computed
    get showSearchResults() {
        return this.searchValue.length > 0;
    }
}

export default VpnStore;
