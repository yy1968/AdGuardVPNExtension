// !IMPORTANT!
// For Firefox export './chrome/proxyApi' is replaced by webpack
// with NormalModuleReplacementPlugin to './firefox/proxyApi'
import browserProxy from './chrome/proxyApi';

const proxyApi = (() => {
    if (!browserProxy) {
        return {
            proxyGet: () => {},
            proxySet: () => {},
            onProxyError: {
                addListener: () => {},
                removeListener: () => {},
            },
        };
    }
    return browserProxy;
})();

export default proxyApi;
