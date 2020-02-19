import isEqual from 'lodash/isEqual';
import qs from 'qs';
import axios from 'axios';
import log from '../../lib/logger';
import { getClosestEndpointByCoordinates } from '../../lib/helpers';
import { MESSAGES_TYPES } from '../../lib/constants';
import { POPUP_DEFAULT_SUPPORT_URL } from '../config';
import connectivity from '../connectivity';

class EndpointsService {
    endpoints = null;

    vpnInfo = null;

    currentLocation = null;

    constructor(browserApi, proxy, credentials, connectivity, vpnProvider) {
        this.proxy = proxy;
        this.credentials = credentials;
        this.connectivity = connectivity;
        this.vpnProvider = vpnProvider;
        this.browserApi = browserApi;
    }

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
        const endpoints = this.updateEndpoints(newEndpoints);
        // this.countPing();
        return endpoints;
    };

    updateEndpoints = async (endpoints) => {
        if (isEqual(endpoints, this.endpoints)) {
            return this.endpoints;
        }
        this.endpoints = endpoints;

        this.browserApi.runtime.sendMessage({
            type: MESSAGES_TYPES.ENDPOINTS_UPDATED,
            data: endpoints,
        });

        return this.endpoints;
    };

    pollPing = async (domainName) => {
        const start = Date.now();
        try {
            await axios(`https://${domainName}`);
        } catch (e) {
            console.log(e);
        }
        const end = Date.now();
        return end - start;
    };

    determinePingToEndpoint = async (domainName) => {
        const POLLS_NUM = 3;
        const results = [];
        for (let i = 0; i < POLLS_NUM; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            const result = await this.pollPing(domainName);
            results.push(result);
        }
        const sum = results.reduce((prev, next) => prev + next);
        return Math.floor(sum / POLLS_NUM);
    };

    promiseBatchMap = async (arr, batchSize, handler) => {
        const chunkArray = (arr, size) => arr.reduce((chunks, el, idx) => {
            if (idx % size === 0) {
                chunks.push([el]);
            } else {
                chunks[chunks.length - 1].push(el);
            }
            return chunks;
        }, []);

        const batches = chunkArray(arr, batchSize);

        const result = [];

        // eslint-disable-next-line no-restricted-syntax
        for (const batch of batches) {
            const promises = batch.map(handler);
            // eslint-disable-next-line no-await-in-loop
            const data = await Promise.all(promises);
            result.push(data);
        }

        return result.flat(Infinity);
    };

    determinePing = async () => {
        if (!this.endpoints) {
            this.endpoints = await this.getEndpointsRemotely();
        }

        const currentEndpoint = await this.proxy.getCurrentEndpoint();

        const endpointsValues = Object.values(this.endpoints).filter(endpoint => {
            return endpoint.id !== currentEndpoint.id;
        });
        console.time('ping');

        const handler = async (endpoint) => {
            const ping = await connectivity.endpointsPing.getPingToEndpoint(endpoint.domainName);
            endpoint.ping = ping;
            console.log('PING: ', ping);
            return endpoint;
        };

        const result = await this.promiseBatchMap(endpointsValues, 20, handler);
        console.timeEnd('ping');
        console.log(result.map(({ id, ping }) => ({ id, ping })));
    };

    countPing = async () => {
        if (!this.endpoints) {
            return;
        }

        // noinspection ES6MissingAwait
        Object.values(this.endpoints).forEach(async (endpoint) => {
            // eslint-disable-next-line no-param-reassign
            endpoint.ping = await connectivity.endpointsPing.getPingToEndpoint(endpoint.domainName);

            this.browserApi.runtime.sendMessage({
                type: MESSAGES_TYPES.ENDPOINTS_PING_UPDATED,
                data: endpoint,
            });
        });
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

        if ((endpoints && endpoints.length > 0) && currentEndpoint) {
            const currentEndpointInEndpoints = currentEndpoint && Object.keys(endpoints)
                .some((endpoint) => endpoint === currentEndpoint.id);

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
        if (this.endpoints) {
            return this.endpoints;
        }
        return null;
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
        const endpoints = this.getEndpoints();

        if (!currentLocation || !endpoints) {
            return null;
        }

        const closestEndpoint = getClosestEndpointByCoordinates(
            currentLocation,
            Object.values(endpoints)
        );

        await this.proxy.setCurrentEndpoint(closestEndpoint);
        return closestEndpoint;
    };

    // TODO [maximtop] consider moving this login in another place
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
}

export default EndpointsService;
