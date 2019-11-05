import { ACCOUNT_API_URL } from '../config';
import Api from './Api';

class AccountApi extends Api {
    GET_VPN_TOKEN = { path: 'products/licenses/vpn.json', method: 'GET' };

    getVpnToken(accessToken) {
        const { path, method } = this.GET_VPN_TOKEN;
        const config = {
            headers: { Authorization: `Bearer ${accessToken}` },
        };
        return this.makeRequest(path, method, config);
    }

    GET_ACCOUNT_INFO = { path: 'get_info', method: 'GET' };

    // TODO [maximtop] change when api for getting email will be ready
    getAccountInfo() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('maxaimtop@gmail.com');
            }, 500);
        });
    }
}

const accountApi = new AccountApi(ACCOUNT_API_URL);

export default accountApi;
