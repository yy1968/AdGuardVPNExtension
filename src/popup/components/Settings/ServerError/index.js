import React from 'react';

import './server-error.pcss';

const ServerError = ({ handleClick }) => {
    return (
        <div className="server-error">
            <div className="server-error__image" />
            <div className="server-error__title">
                Server not responding
            </div>
            <button
                type="button"
                className="button button--medium button--green-gradient"
                onClick={handleClick}
            >
                Choose another
            </button>
        </div>
    );
};

export default ServerError;
