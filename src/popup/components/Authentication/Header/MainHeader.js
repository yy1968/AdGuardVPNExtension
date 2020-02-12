import React from 'react';

function MainHeader() {
    return (
        <div className="auth__header">
            <svg className="icon icon--logo">
                <use xlinkHref="#logo" />
            </svg>
        </div>
    );
}

export default MainHeader;
