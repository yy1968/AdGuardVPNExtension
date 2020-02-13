import React from 'react';

const Upgrade = () => (
    <div className="global-error global-error--upgrade">
        <div className="global-error__content">
            <div className="global-error__icon global-error__icon--error" />
                <div className="global-error__title">
                    VPN is disabled
                </div>
            <div className="global-error__description">
                {'You\'ve run out of data'}
            </div>
        </div>
        <div className="global-error__actions">
            <a className="button button--medium button--green-gradient global-error__button">
                Upgrade
            </a>
        </div>
    </div>
);

export default Upgrade;
