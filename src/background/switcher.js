import { runWithCancel } from '../lib/helpers';
import credentials from './credentials';
import { proxy } from './proxy';
import connectivity from './connectivity/connectivity';
import actions from './actions';
import log from '../lib/logger';
import browserApi from './browserApi';
import { MESSAGES_TYPES } from '../lib/constants';
import webrtc from './browserApi/webrtc';

function* turnOnProxy(webRTCHandleEnabled) {
    try {
        const accessPrefix = yield credentials.getAccessPrefix();
        const { host, domainName } = yield proxy.setAccessPrefix(accessPrefix);
        const vpnToken = yield credentials.gainValidVpnToken();
        yield connectivity.setCredentials(host, domainName, vpnToken.token, true);
        yield proxy.turnOn();
        webrtc.enableWebRTC(webRTCHandleEnabled);
        yield actions.setIconEnabled();
        browserApi.runtime.sendMessage({ type: MESSAGES_TYPES.EXTENSION_PROXY_ENABLED });
    } catch (e) {
        yield connectivity.stop();
        yield proxy.turnOff();
        webrtc.disableWebRTC(webRTCHandleEnabled);
        yield actions.setIconDisabled();
        browserApi.runtime.sendMessage({ type: MESSAGES_TYPES.EXTENSION_PROXY_DISABLED });
        log.error(e && e.message);
        throw e;
    }
}

function* turnOffProxy(webRTCHandleEnabled) {
    try {
        yield connectivity.stop();
        yield proxy.turnOff();
        webrtc.disableWebRTC(webRTCHandleEnabled);
        yield actions.setIconDisabled();
        browserApi.runtime.sendMessage({ type: MESSAGES_TYPES.EXTENSION_PROXY_DISABLED });
    } catch (e) {
        log.error(e && e.message);
        throw e;
    }
}

class Switcher {
    turnOn(withCancel) {
        if (this.cancel && withCancel) {
            this.cancel();
        }
        const { promise, cancel } = runWithCancel(turnOnProxy);
        this.cancel = cancel;
        this.promise = promise;
        return promise;
    }

    turnOff(withCancel) {
        if (this.cancel && withCancel) {
            this.cancel();
        }
        const { promise, cancel } = runWithCancel(turnOffProxy);
        this.cancel = cancel;
        this.promise = promise;
        return promise;
    }
}

const switcher = new Switcher();

export default switcher;
