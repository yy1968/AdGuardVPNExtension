import React from 'react';

const GlobalControl = ({ handleConnect, handleDisconnect, enabled }) => {
    if (enabled) {
        return (
            <button
                type="button"
                className="button button--medium button--outline-secondary"
                onClick={handleDisconnect}
            >
                Disconnect
            </button>
        );
    }

    return (
        <button
            type="button"
            className="button button--medium button--green-gradient"
            onClick={handleConnect}
        >
            Connect
        </button>
    );
};

export default GlobalControl;
