import { accountApi } from '../api';
import CustomError from '../../lib/CustomError';
import { ERROR_STATUSES } from '../../lib/constants';

const getVpnToken = async (accessToken) => {
    const VALID_VPN_TOKEN_STATUS = 'VALID';

    const vpnTokenData = await accountApi.getVpnToken(accessToken);

    const vpnToken = vpnTokenData.tokens.find(token => token.token === vpnTokenData.token);

    const isValidTokenFound = vpnToken && vpnToken.license_status === VALID_VPN_TOKEN_STATUS;

    console.log(adguard.valid);
    if (!adguard.valid) {
        throw new CustomError(ERROR_STATUSES.INVALID_TOKEN_ERROR, 'received token is not valid');
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
        licenseStatus,
        timeExpiresSec,
        licenseKey,
        subscription,
    };
};

export default {
    getVpnToken,
};
