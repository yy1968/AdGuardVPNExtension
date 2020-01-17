import browser from 'webextension-polyfill';

const handleBlockWebRTC = (webRTCDisabled) => {
    // Edge doesn't support privacy api
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/privacy
    if (!browser.privacy) {
        return;
    }

    const resetLastError = () => {
        const ex = browser.runtime.lastError;
        if (ex) {
            adguard.console.error('Error updating privacy.network settings: {0}', ex);
        }
    };

    // Since chromium 48
    if (typeof browser.privacy.network.webRTCIPHandlingPolicy === 'object') {
        if (webRTCDisabled) {
            browser.privacy.network.webRTCIPHandlingPolicy.set({
                value: 'disable_non_proxied_udp',
                scope: 'regular',
            }, resetLastError);
        } else {
            browser.privacy.network.webRTCIPHandlingPolicy.clear({
                scope: 'regular',
            }, resetLastError);
        }
    }

    if (typeof browser.privacy.network.peerConnectionEnabled === 'object') {
        if (webRTCDisabled) {
            browser.privacy.network.peerConnectionEnabled.set({
                value: false,
                scope: 'regular',
            }, resetLastError);
        } else {
            browser.privacy.network.peerConnectionEnabled.clear({
                scope: 'regular',
            }, resetLastError);
        }
    }
};

let WEB_RTC_BLOCK_PERMISSION_ENABLED = false;

const blockWebRTC = () => {
    if (!WEB_RTC_BLOCK_PERMISSION_ENABLED) {
        return;
    }
    handleBlockWebRTC(true);
};

const unblockWebRTC = (force = false) => {
    if (!WEB_RTC_BLOCK_PERMISSION_ENABLED || !force) {
        return;
    }
    handleBlockWebRTC(false);
};

const setWebRTCHandleEnabled = (webRTCPermissionEnabled, proxyEnabled) => {
    WEB_RTC_BLOCK_PERMISSION_ENABLED = webRTCPermissionEnabled;
    console.log(webRTCPermissionEnabled, proxyEnabled);
    if (!webRTCPermissionEnabled) {
        unblockWebRTC(true);
    } else if (webRTCPermissionEnabled && proxyEnabled) {
        blockWebRTC();
    }
};

export default {
    blockWebRTC,
    unblockWebRTC,
    setWebRTCHandleEnabled,
};
