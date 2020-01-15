import browser from 'webextension-polyfill';
import { getHostname } from '../../../lib/helpers';
import { CONNECTION_MODES, CONNECTION_TYPE_FIREFOX } from '../proxyConsts';

/**
 * @typedef proxyConfig
 * @type {Object}
 * @property {string} mode - proxy mode 'system' or 'fixed_servers'
 * @property {string[]} [bypassList] - array of bypassed values
 * @property {string} [host] - proxy host address
 * @property {number} [port] - proxy port
 * @property {string} [scheme] - proxy scheme
 * e.g.   const config = {
 *            mode: 'system',
 *            bypassList: ['example.org', 'localhost', '0.0.0.0/8'],
 *            host: 'feabca59e815de4faab448d75a628118.do-de-fra1-01.adguard.io',
 *            port: 443,
 *            scheme: 'https',
 *            inverted: false,
 *        };
 */

/**
 * @typedef firefoxConfig
 * @type {Object}
 *
 * e.g.     const firefoxConfig = {
 *              bypassList: ['example.org', 'localhost', '0.0.0.0/8'],
 *              proxyConfig: {
 *                  type: "https",
 *                  host: "137a393d3d36ddefc11adeca9e46a763.do-de-fra1-01.adguard.io",
 *                  port: 443
 *              }
 *          };
 */

/**
 * Converts proxyConfig to chromeConfig
 * @param proxyConfig
 * @returns {firefoxConfig}
 */
const convertToFirefoxConfig = (proxyConfig) => {
    const {
        mode, bypassList, host, port, scheme, inverted, credentials,
    } = proxyConfig;
    if (mode === CONNECTION_MODES.SYSTEM) {
        return {
            proxyConfig: {
                type: CONNECTION_TYPE_FIREFOX.DIRECT,
            },
        };
    }
    return {
        inverted,
        bypassList,
        proxyConfig: {
            type: scheme,
            host,
            port,
        },
        credentials,
    };
};

const directConfig = {
    type: CONNECTION_TYPE_FIREFOX.DIRECT,
};

let GLOBAL_FIREFOX_CONFIG = {
    proxyConfig: directConfig,
};

const isBypassed = (url) => {
    const hostname = getHostname(url);
    const { bypassList } = GLOBAL_FIREFOX_CONFIG;
    console.log(bypassList);
    if (!bypassList) {
        return true;
    }
    return !!(bypassList.includes(hostname));
};


const proxyHandler = (details) => {
    let shouldBypass = isBypassed(details.url);

    shouldBypass = GLOBAL_FIREFOX_CONFIG.inverted ? !shouldBypass : shouldBypass;

    if (shouldBypass) {
        return directConfig;
    }

    return GLOBAL_FIREFOX_CONFIG.proxyConfig;
};

/**
 * Updates proxy config
 * @param {proxyConfig} proxyConfig
 * @returns {Promise<void>}
 */
const proxySet = async (proxyConfig) => {
    GLOBAL_FIREFOX_CONFIG = convertToFirefoxConfig(proxyConfig);
    if (browser.proxy.onRequest.hasListener(proxyHandler)) {
        return;
    }
    browser.proxy.onRequest.addListener(proxyHandler, { urls: ['<all_urls>'] });
};

const onProxyError = (() => {
    return {
        addListener: (cb) => {
            browser.proxy.onError.addListener(cb);
        },
        removeListener: (cb) => {
            browser.proxy.onError.removeListener(cb);
        },
    };
})();

const proxyGet = (config = {}) => new Promise((resolve) => {
    browser.proxy.settings.get(config, (details) => {
        resolve(details);
    });
});

const proxyClear = () => {
    GLOBAL_FIREFOX_CONFIG = {
        proxyConfig: directConfig,
    };
    browser.proxy.onRequest.removeListener(proxyHandler);
};

const onAuthRequiredHandler = (details) => {
    const { challenger } = details;
    if (challenger && challenger.host !== GLOBAL_FIREFOX_CONFIG.host) {
        return {};
    }
    const { username, password } = GLOBAL_FIREFOX_CONFIG.credentials;
    return { authCredentials: { username, password } };
};

browser.webRequest.onAuthRequired.addListener(onAuthRequiredHandler, { urls: ['<all_urls>'] }, ['blocking']);

const proxyApi = {
    proxySet,
    proxyGet,
    proxyClear,
    onProxyError,
};

export default proxyApi;
