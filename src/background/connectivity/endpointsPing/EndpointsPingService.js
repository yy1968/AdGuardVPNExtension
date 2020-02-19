import { renderTemplate } from '../../../lib/string-utils';
import { WS_API_URL_TEMPLATE } from '../../config';
import { getAveragePing } from '../helpers';

class EndpointsPingService {
    constructor(credentials, wsFactory) {
        this.credentials = credentials;
        this.wsFactory = wsFactory;
    }

    getPingToEndpoint = async (domainName) => {
        const { prefix, token } = await this.credentials.getAccessCredentials();
        const appId = this.credentials.getAppId();
        const wsHost = `${prefix}.${domainName}`;
        const websocketUrl = renderTemplate(WS_API_URL_TEMPLATE, { host: wsHost });
        let averagePing;

        try {
            const websocket = await this.wsFactory.getWebsocket(websocketUrl);
            console.time(`open ${domainName}`);
            await websocket.open();
            console.timeEnd(`open ${domainName}`);
            console.time(`ping ${domainName}`);
            averagePing = await getAveragePing(websocket, token, appId);
            console.timeEnd(`ping ${domainName}`);
            console.time(`close ${websocketUrl}`);
            websocket.close();
        } catch (e) {
            console.log('was unable to get ping', websocketUrl);
        }

        return averagePing;
    };
}

export default EndpointsPingService;
