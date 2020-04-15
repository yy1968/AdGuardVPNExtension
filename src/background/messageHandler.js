import browser from 'webextension-polyfill';
import { MESSAGES_TYPES } from '../lib/constants';
import auth from './auth';
import popupData from './popupData';
import endpoints from './endpoints';

const messagesHandler = async (message, sender) => {
    const { type, data } = message;
    switch (type) {
        case MESSAGES_TYPES.AUTHENTICATE_SOCIAL: {
            const { tab: { id } } = sender;
            const { queryString } = message;
            return auth.authenticateSocial(queryString, id);
        }
        case MESSAGES_TYPES.GET_POPUP_DATA: {
            const { url, numberOfTries } = data;
            // TODO replace getPopupDataRetryWithCancel to getPopupDataRetry
            return popupData.getPopupDataRetryWithCancel(url, numberOfTries);
        }
        case MESSAGES_TYPES.GET_VPN_FAILURE_PAGE: {
            return endpoints.getVpnFailurePage();
        }
        default:
            throw new Error(`Unknown message type received: ${type}`);
    }
    // TODO check if it works if return something else
    return Promise.resolve();
};

const init = () => {
    browser.runtime.onMessage.addListener(messagesHandler);
};

export default {
    init,
};
