import { accountApi } from '../api';

const getVpnToken = async (accessToken) => {
    const vpnTokenData = await accountApi.getVpnToken(accessToken);

    const vpnToken = vpnTokenData.tokens.find(token => token.token === vpnTokenData.token);

    if (!vpnToken) {
        return null;
    }

    const {
        token,
        license_status: licenseStatus,
        time_expires_sec: timeExpiresSec,
        license_key: licenseKey,
        subscription,
    } = vpnToken;

    return {
        token,
        licenseStatus: adguard.valid ? licenseStatus : 'BLOCKED',
        timeExpiresSec,
        licenseKey,
        subscription,
    };
};

const getAccountInfo = async (accessToken) => {
    const { email } = await accountApi.getAccountInfo(accessToken);
    return email;
};

export default {
    getVpnToken,
    getAccountInfo,
};
