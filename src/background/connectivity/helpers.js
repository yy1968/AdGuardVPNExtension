import protobuf from 'protobufjs/light';
import connectivityJson from './connectivity.json';
import { stringToUint8Array } from '../../lib/string-utils';

const { WsConnectivityMsg, WsPingMsg } = protobuf.Root.fromJSON(connectivityJson);

const preparePingMessage = (currentTime, vpnToken, appId) => {
    const pingMsg = WsPingMsg.create({
        requestTime: currentTime,
        token: stringToUint8Array(vpnToken),
        applicationId: stringToUint8Array(appId),
    });
    const protocolMsg = WsConnectivityMsg.create({ pingMsg });
    return WsConnectivityMsg.encode(protocolMsg).finish();
};

const decodeMessage = (arrBufMessage) => {
    const message = WsConnectivityMsg.decode(new Uint8Array(arrBufMessage));
    return WsConnectivityMsg.toObject(message);
};

const pollPing = (websocket, vpnToken, appId) => new Promise((resolve, reject) => {
    const arrBufMessage = preparePingMessage(Date.now(), vpnToken, appId);
    websocket.send(arrBufMessage);

    const messageHandler = (event) => {
        const receivedTime = Date.now();
        const { pingMsg } = decodeMessage(event.data);
        if (pingMsg) {
            const { requestTime } = pingMsg;
            const ping = receivedTime - requestTime;
            websocket.removeMessageListener(messageHandler);
            resolve(ping);
            return;
        }
        reject(new Error('Got wrong response'));
    };

    websocket.onMessage(messageHandler);
});

export const getAveragePing = async (websocket, vpnToken, appId) => {
    const POLLS_NUM = 3;
    const results = [];
    for (let i = 0; i < POLLS_NUM; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const result = await pollPing(websocket, vpnToken, appId);
        results.push(result);
    }
    const sum = results.reduce((prev, next) => prev + next);
    return Math.floor(sum / POLLS_NUM);
};
