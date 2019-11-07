import React, { useContext } from 'react';
import browser from 'webextension-polyfill';
import { observer } from 'mobx-react';
import rootStore from '../../stores';
import './global-error.pcss';

const GlobalError = observer(() => {
    const { settingsStore } = useContext(rootStore);

    const handleTryAgain = async () => {
        await settingsStore.checkPermissions();
    };

    return (
        <div className="global-error">
            <div className="global-error__icon" />
            <div className="global-error__title">
                {browser.i18n.getMessage('global_error_title')}
            </div>
            <div className="global-error__description">
                {browser.i18n.getMessage('global_error_description')}
            </div>
            <div className="button">
                {browser.i18n.getMessage('global_error_learn_more')}
            </div>
            <div
                className="button"
                onClick={handleTryAgain}
            >
                {browser.i18n.getMessage('global_error_try_again')}
            </div>
        </div>
    );
});

export default GlobalError;
