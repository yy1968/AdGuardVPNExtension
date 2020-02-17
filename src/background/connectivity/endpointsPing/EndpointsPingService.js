import { renderTemplate } from '../../../lib/string-utils';
import { WS_API_URL_TEMPLATE } from '../../config';
import { getAveragePing } from '../helpers';

class EndpointsPingService {
    constructor(credentials, wsFactory) {
        this.credentials = credentials;
        this.wsFactory = wsFactory;
    }

    getPingToEndpoint = async (endpoint) => {
        const { domainName } = endpoint;
        const { prefix, token } = await this.credentials.getAccessCredentials();
        const appId = this.credentials.getAppId();
        const wsHost = `${prefix}.${domainName}`;
        const websocketUrl = renderTemplate(WS_API_URL_TEMPLATE, { host: wsHost });
        const websocket = await this.wsFactory.getWebsocket(websocketUrl);
        await websocket.open();
        const averagePing = await getAveragePing(websocket, token, appId);
        await websocket.close();
        return averagePing;
    };
}

export default EndpointsPingService;
