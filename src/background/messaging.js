import browser from 'webextension-polyfill';
import debounce from 'lodash/debounce';
import { MESSAGES_TYPES } from '../lib/constants';
import auth from './auth';
import notifier from '../lib/notifier';
import { proxy } from './proxy';
import connectivity from './connectivity/connectivity';
import log from '../lib/logger';
import credentials from './credentials';


// message handler used for message exchange with content pages only
// for other cases use global variable "adguard"
// eslint-disable-next-line no-unused-vars
const messagesHandler = (request, sender, sendResponse) => {
    const { type } = request;
    switch (type) {
        case MESSAGES_TYPES.AUTHENTICATE_SOCIAL: {
            const { tab: { id } } = sender;
            const { queryString } = request;
            auth.authenticateSocial(queryString, id);
            break;
        }
        default:
            break;
    }
    return true;
};

const updateCredentials = debounce(async () => {
    const accessPrefix = await credentials.getAccessPrefix();
    const { host, domainName } = await proxy.setAccessPrefix(accessPrefix);
    const vpnToken = await credentials.gainValidVpnToken();
    await connectivity.setCredentials(host, domainName, vpnToken.token);
    log.info('VPN credentials updated');
}, 100);

const init = () => {
    browser.runtime.onMessage.addListener(messagesHandler);
    notifier.addSpecifiedListener(notifier.types.CREDENTIALS_UPDATED, updateCredentials);
};

export default {
    init,
};
