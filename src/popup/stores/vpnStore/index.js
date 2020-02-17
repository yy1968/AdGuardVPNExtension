import {
    action,
    computed,
    observable,
    runInAction,
    toJS,
} from 'mobx';

class VpnStore {
    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @observable endpointsList;

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
    getEndpoints = async () => {
        const endpointsList = adguard.endpoints.getEndpoints();
        this.setEndpoints(endpointsList);
    };

    @action
    setEndpoints = (endpointsList) => {
        if (!endpointsList) {
            return;
        }
        this.endpointsList = endpointsList;
    };

    @action
    selectEndpoint = async (id) => {
        const selectedEndpoint = this.endpointsList[id];
        await adguard.proxy.setCurrentEndpoint(toJS(selectedEndpoint));
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
        if (!this.endpointsList) {
            return [];
        }
        return Object.values(this.endpointsList).filter((endpoint) => {
            if (!this.searchValue || this.searchValue.length === 0) {
                return true;
            }
            const regex = new RegExp(this.searchValue, 'ig');
            return (endpoint.cityName && endpoint.cityName.match(regex))
                || (endpoint.countryName && endpoint.countryName.match(regex));
        }).map((endpoint) => {
            if (this.selectedEndpoint && this.selectedEndpoint.id === endpoint.id) {
                return { ...endpoint, selected: true };
            }
            return endpoint;
        });
    }

    // TODO [maximtop] fastest endpoints
    @computed
    get fastestEndpoints() {
        return [];
    }

    // TODO [maximtop] history endpoints
    @computed
    get historyEndpoints() {
        return [];
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
    getVpnInfo = async () => {
        const vpnInfo = adguard.endpoints.getVpnInfo();
        this.setVpnInfo(vpnInfo);
    };

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
