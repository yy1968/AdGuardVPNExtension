import { renderTemplate } from '../../../lib/string-utils';
import { WS_API_URL_TEMPLATE } from '../../config';
import { getAveragePing } from '../helpers';
import log from '../../../lib/logger';

class EndpointsPingService {
    constructor(credentials, websocketFactory) {
        this.credentials = credentials;
        this.websocketFactory = websocketFactory;
    }

    getPingToEndpoint = async (domainName) => {
        const { prefix, token } = await this.credentials.getAccessCredentials();
        const appId = this.credentials.getAppId();
        const wsHost = `${prefix}.${domainName}`;
        const websocketUrl = renderTemplate(WS_API_URL_TEMPLATE, { host: wsHost });

        let averagePing;
        try {
            const websocket = await this.websocketFactory.getNativeWebsocket(websocketUrl);
            await websocket.open();
            averagePing = await getAveragePing(websocket, token, appId);
            websocket.close();
        } catch (e) {
            log.error('Was unable to get ping', websocketUrl);
        }

        return averagePing;
    };
}

export default EndpointsPingService;
