import { proxy } from './proxy';
import settings from './settings';
import { MESSAGES_TYPES } from '../lib/constants';
import browserApi from './browserApi';

class AppStatus {
    constructor() {
        this.permissionsError = null;
    }

    setPermissionsError(error) {
        this.permissionsError = error;
        browserApi.runtime.sendMessage({
            type: MESSAGES_TYPES.PERMISSIONS_UPDATE_ERROR,
            data: error,
        });
    }

    getPermissionsError() {
        return this.permissionsError;
    }

    clearPermissionError() {
        this.permissionsError = null;
    }

    async canControlProxy() {
        const controlStatus = await proxy.canControlProxy();
        if (controlStatus.canControlProxy) {
            return controlStatus;
        }

        // Turns off proxy if proxy was enabled
        const proxyEnabled = await settings.isProxyEnabled();
        if (proxyEnabled) {
            await settings.disableProxy();
        }

        return controlStatus;
    }
}

const appStatus = new AppStatus();

export default appStatus;
