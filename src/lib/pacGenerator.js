// TODO [maximtop] find out how to handle non routable ipv4 addresses,
//  currently I think that it is bad idea to use dnsResolve,
//  because it would cause excess dns requests
//  also if provide to isInNet some hostname string, then browser would cause dns lookup too
// if (isInNet(dnsResolve(host), '10.0.0.0', '255.0.0.0')
//     || isInNet(dnsResolve(host), '172.16.0.0', '255.240.0.0')
//     || isInNet(dnsResolve(host), '192.168.0.0', '255.255.0.0')
//     || isInNet(dnsResolve(host), '127.0.0.0', '255.255.255.0')) {
//     return 'DIRECT';
// }

function proxyPacScript(proxy, exclusionsList, inverted) {
    return `function FindProxyForURL(url, host) {
                const DIRECT = "DIRECT";
                const PROXY = "HTTPS ${proxy}";

                if (isPlainHostName(host)
                    || shExpMatch(host, 'localhost')) {
                    return DIRECT;
                }

                const inverted = ${inverted};
                const list = [${exclusionsList.map(l => `"${l}"`).join(', ')}];

                if (list.some(el => shExpMatch(host, el))) {
                    if (inverted) {
                        return PROXY;
                    } else {
                        return DIRECT;
                    }
                }

                return inverted ? DIRECT : PROXY;
            }`;
}

function directPacScript() {
    return `function FindProxyForURL() {
        return 'DIRECT';
    }`;
}

const generate = (proxy, exclusionsList = [], inverted = false) => {
    if (!proxy) {
        return directPacScript();
    }

    return proxyPacScript(proxy, exclusionsList, inverted);
};

export default { generate };
