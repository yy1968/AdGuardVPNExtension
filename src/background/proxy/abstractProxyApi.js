/**
 * This module used only to show api interface
 * export './abstractProxyApi' is replaced during webpack compilation
 * with NormalModuleReplacementPlugin to proper browser implementation
 * from './firefox/proxyApi' or ./chrome/proxyApi
 */
const abstractProxyApi = (() => {
    return {
        proxyGet: () => {},
        proxySet: () => {},
        onProxyError: {
            addListener: () => {},
            removeListener: () => {},
        },
    };
})();

export default abstractProxyApi;
