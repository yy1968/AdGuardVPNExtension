import { accountApi } from '../api';

// FIXME use url from tds
const REFERRAL_URL = 'https://adguard-vpn.com/join/';

const getVpnToken = async (accessToken) => {
    const vpnTokenData = await accountApi.getVpnToken(accessToken);

    if (!vpnTokenData || !vpnTokenData.tokens) {
        return null;
    }

    const vpnToken = vpnTokenData.tokens.find((token) => {
        if (vpnTokenData.token) {
            return token.token === vpnTokenData.token;
        }
        return token.token;
    });

    if (!vpnToken) {
        return null;
    }

    const {
        token,
        license_status: licenseStatus,
        time_expires_sec: timeExpiresSec,
        license_key: licenseKey,
        subscription,
        vpn_subscription: vpnSubscription,
    } = vpnToken;

    return {
        token,
        licenseStatus,
        timeExpiresSec,
        licenseKey,
        subscription,
        vpnSubscription,
    };
};

const getReferralData = async (accessToken) => {
    const referralData = await accountApi.getReferralData(accessToken);
    const {
        invite_id: inviteId,
        invites_count: invitesCount,
        max_invites_count: maxInvitesCount,
    } = referralData;
    // FIXME use url from tds for inviteUrl
    return {
        inviteUrl: `${REFERRAL_URL}${inviteId}`,
        invitesCount,
        maxInvitesCount,
    };
};

const getAccountInfo = async (accessToken) => {
    const { email } = await accountApi.getAccountInfo(accessToken);
    return email;
};

export default {
    getVpnToken,
    getAccountInfo,
    getReferralData,
};
