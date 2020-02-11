import React from 'react';

function MainHeader() {
    return (
        <span className="auth__header">
            <svg className="auth__logo">
                <use xlinkHref="#tree" />
            </svg>
            <div className="auth__beta">
                Beta
            </div>
            <div className="auth__title">
                AdGuard VPN
            </div>
        </span>
    );
}

export default MainHeader;
