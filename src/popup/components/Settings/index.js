import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import rootStore from '../../stores';

import CurrentEndpoint from './CurrentEndpoint';
import GlobalControl from './GlobalControl';
import Status from './Status';
import SiteInfo from './SiteInfo';
import StatusImage from './StatusImage';

import './settings.pcss';

const getStatusMessage = (proxyEnabled) => {
    if (proxyEnabled) {
        return 'Connected';
    }
    return 'Disabled';
};

const Settings = observer(() => {
    const { settingsStore, uiStore } = useContext(rootStore);

    const handleEndpointSelectorClick = () => {
        uiStore.openEndpointsSearch();
    };

    const handleConnect = async () => {
        await settingsStore.setProxyState(true);
    };

    const handleDisconnect = async () => {
        await settingsStore.setProxyState(false);
    };

    const {
        switcherEnabled,
        proxyEnabled,
    } = settingsStore;

    const settingsClass = classnames('settings', { 'settings--active': proxyEnabled });

    return (
        <div className={settingsClass}>
            <div className="settings__main">
                <StatusImage />
                <SiteInfo />
                <Status status={getStatusMessage(proxyEnabled)} />
                <GlobalControl
                    handleConnect={handleConnect}
                    handleDisconnect={handleDisconnect}
                    enabled={switcherEnabled}
                />
            </div>
            <CurrentEndpoint
                handle={handleEndpointSelectorClick}
            />
        </div>
    );
});

export default Settings;
