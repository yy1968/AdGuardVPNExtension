import React from 'react';

import translator from '../../../../lib/translator';

const GlobalControl = ({ handleConnect, handleDisconnect, enabled }) => {
    if (enabled) {
        return (
            <button
                type="button"
                className="button button--medium button--outline-secondary"
                onClick={handleDisconnect}
            >
                {translator.translate('settings_disconnect')}
            </button>
        );
    }

    return (
        <button
            type="button"
            className="button button--medium button--green-gradient"
            onClick={handleConnect}
        >
            {translator.translate('settings_connect')}
        </button>
    );
};

export default GlobalControl;
