import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import './header.pcss';
import rootStore from '../../stores';

const Header = observer(({ showMenuButton }) => {
    const { uiStore } = useContext(rootStore);

    const handleOpenModal = () => {
        uiStore.openOptionsModal(true);
    };

    const headerClass = classnames({
        header: true,
        'header--main': showMenuButton,
    });

    if (!showMenuButton) {
        return null;
    }

    return (
        <div className={headerClass}>
            <div className="header__title">
                <div className="header__logo">
                    AdGuard&nbsp;
                    <span className="header__logo-subtitle">VPN</span>
                </div>
                <div className="badge header__beta">Beta</div>
            </div>
            <button
                className="button header__setting"
                type="button"
                tabIndex="0"
                onClick={handleOpenModal}
            >
                <svg className="icon icon--button icon--options">
                    <use xlinkHref="#options" />
                </svg>
            </button>
        </div>
    );
});

Header.defaultProps = {
    authenticated: false,
};

export default Header;
