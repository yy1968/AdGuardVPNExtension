import isEqual from 'lodash/isEqual';
import _ from 'lodash';
import qs from 'qs';
import log from '../../lib/logger';
import { getClosestEndpointByCoordinates } from '../../lib/helpers';
import { MESSAGES_TYPES } from '../../lib/constants';
import { POPUP_DEFAULT_SUPPORT_URL } from '../config';
import EndpointsManager from './EndpointsManager';

class EndpointsService {
    vpnInfo = null;

    currentLocation = null;

    constructor(browserApi, proxy, credentials, connectivity, vpnProvider, storage) {
        this.proxy = proxy;
        this.credentials = credentials;
        this.connectivity = connectivity;
        this.vpnProvider = vpnProvider;
        this.browserApi = browserApi;
        this.storage = storage;
    }

    init = async () => {
        this.endpointsManager = new EndpointsManager(
            this.browserApi,
            this.connectivity,
            this.storage
        );
        await this.endpointsManager.init();
    };

    reconnectEndpoint = async (endpoint) => {
        const { domainName } = await this.proxy.setCurrentEndpoint(endpoint);
        const { prefix, token } = await this.credentials.getAccessCredentials();
        const wsHost = `${prefix}.${domainName}`;
        await this.connectivity.endpointConnectivity.setCredentials(wsHost, domainName, token);
    };

    getClosestEndpointAndReconnect = async (endpoints, currentEndpoint) => {
        const endpointsArr = Object.keys(endpoints)
            .map((endpointKey) => endpoints[endpointKey]);

        const sameCityEndpoint = endpointsArr.find((endpoint) => {
            return endpoint.cityName === currentEndpoint.cityName;
        });

        if (sameCityEndpoint) {
            await this.reconnectEndpoint(sameCityEndpoint);
            log.debug(`Reconnect endpoint from ${currentEndpoint.id} to same city ${sameCityEndpoint.id}`);
            return;
        }

        const closestCityEndpoint = getClosestEndpointByCoordinates(currentEndpoint, endpointsArr);
        await this.reconnectEndpoint(closestCityEndpoint);
        log.debug(`Reconnect endpoint from ${currentEndpoint.id} to closest city ${closestCityEndpoint.id}`);
    };

    getEndpointsRemotely = async () => {
        let vpnToken;

        try {
            vpnToken = await this.credentials.gainValidVpnToken();
        } catch (e) {
            log.debug('Unable to get endpoints token because: ', e.message);
            return null;
        }

        const newEndpoints = await this.vpnProvider.getEndpoints(vpnToken.token);

        const updatedEndpoints = this.endpointsManager.setEndpoints(newEndpoints);

        return updatedEndpoints;
    };

    vpnTokenChanged = (oldVpnToken, newVpnToken) => {
        return oldVpnToken.licenseKey !== newVpnToken.licenseKey;
    };

    getVpnInfoRemotely = async () => {
        let vpnToken;

        try {
            vpnToken = await this.credentials.gainValidVpnToken();
        } catch (e) {
            log.debug('Unable to get endpoints info because: ', e.message);
            return;
        }

        let vpnInfo = await this.vpnProvider.getVpnExtensionInfo(vpnToken.token);
        let shouldReconnect = false;

        if (vpnInfo.refreshTokens) {
            log.info('refreshing tokens');
            const updatedVpnToken = await this.credentials.gainValidVpnToken(true, false);
            if (this.vpnTokenChanged(vpnToken, updatedVpnToken)) {
                shouldReconnect = true;
            }
            await this.credentials.gainValidVpnCredentials(true);
            vpnInfo = await this.vpnProvider.getVpnExtensionInfo(updatedVpnToken.token);
        }

        // update endpoints
        const endpoints = await this.getEndpointsRemotely();

        const currentEndpoint = await this.proxy.getCurrentEndpoint();

        if ((endpoints && !_.isEmpty(endpoints)) && currentEndpoint) {
            const currentEndpointInEndpoints = currentEndpoint && Object.keys(endpoints)
                .some((endpointId) => endpointId === currentEndpoint.id);

            // if there is no currently connected endpoint in the list of endpoints,
            // get closest and reconnect
            if (!currentEndpointInEndpoints) {
                await this.getClosestEndpointAndReconnect(endpoints, currentEndpoint);
                shouldReconnect = false;
            }
        }

        if (shouldReconnect) {
            await this.getClosestEndpointAndReconnect(endpoints, currentEndpoint);
        }

        this.vpnInfo = vpnInfo;

        await this.browserApi.runtime.sendMessage({
            type: MESSAGES_TYPES.VPN_INFO_UPDATED,
            data: vpnInfo,
        });
    };

    getVpnInfo = () => {
        this.getVpnInfoRemotely();

        if (this.vpnInfo) {
            return this.vpnInfo;
        }
        return null;
    };

    getEndpoints = () => {
        return this.endpointsManager.getEndpoints();
    };

    getCurrentLocationRemote = async () => {
        const MIDDLE_OF_EUROPE = { coordinates: [51.05, 13.73] }; // Chosen approximately
        let currentLocation;
        try {
            currentLocation = await this.vpnProvider.getCurrentLocation();
        } catch (e) {
            log.error(e.message);
        }

        // if current location wasn't received use predefined
        currentLocation = currentLocation || MIDDLE_OF_EUROPE;

        if (!isEqual(this.currentLocation, currentLocation)) {
            this.currentLocation = currentLocation;
        }

        return currentLocation;
    };

    getCurrentLocation = () => {
        // update current location information in background
        this.getCurrentLocationRemote();
        if (this.currentLocation) {
            return this.currentLocation;
        }
        return null;
    };

    getSelectedEndpoint = async () => {
        const proxySelectedEndpoint = await this.proxy.getCurrentEndpoint();

        // if found return
        if (proxySelectedEndpoint) {
            return proxySelectedEndpoint;
        }

        const currentLocation = this.getCurrentLocation();
        const endpoints = Object.values(this.endpointsManager.getAll());

        if (!currentLocation || _.isEmpty(endpoints)) {
            return null;
        }

        const closestEndpoint = getClosestEndpointByCoordinates(
            currentLocation,
            endpoints
        );

        await this.proxy.setCurrentEndpoint(closestEndpoint);
        return closestEndpoint;
    };

    // TODO [maximtop] consider moving this function in another place
    getVpnFailurePage = async () => {
        let vpnToken;
        try {
            vpnToken = await this.credentials.gainValidVpnToken();
        } catch (e) {
            log.error('Unable to get valid endpoints token. Error: ', e.message);
        }

        // undefined values will be omitted in the querystring
        const token = vpnToken.token || undefined;

        // if no endpoints info, then get endpoints failure url with empty token
        let appendToQueryString = false;
        if (!this.vpnInfo) {
            try {
                this.vpnInfo = await this.vpnProvider.getVpnExtensionInfo(token);
            } catch (e) {
                this.vpnInfo = { vpnFailurePage: POPUP_DEFAULT_SUPPORT_URL };
                appendToQueryString = true;
            }
        }

        const vpnFailurePage = this.vpnInfo && this.vpnInfo.vpnFailurePage;
        const appId = this.credentials.getAppId();

        const queryString = qs.stringify({ token, app_id: appId });

        const separator = appendToQueryString ? '&' : '?';

        return `${vpnFailurePage}${separator}${queryString}`;
    };

    addToHistory(endpointId) {
        this.endpointsManager.addToHistory(endpointId);
    }
}

export default EndpointsService;