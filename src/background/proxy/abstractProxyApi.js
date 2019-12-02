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
