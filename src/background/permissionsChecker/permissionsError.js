import browserApi from '../browserApi';
import { MESSAGES_TYPES } from '../../lib/constants';

class PermissionsError {
    constructor() {
        this.error = null;
    }

    setError = (error) => {
        this.error = error;
        browserApi.runtime.sendMessage({
            type: MESSAGES_TYPES.PERMISSIONS_ERROR_UPDATE,
            data: error,
        });
    };

    getError = () => {
        return this.error;
    };

    clearError = () => {
        this.error = null;
    };
}

const permissionsError = new PermissionsError();

export default permissionsError;
