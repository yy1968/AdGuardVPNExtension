import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import rootStore from '../../../stores';

import './status.pcss';

const PING_WITH_WARNING = 100;

const Status = observer(() => {
    const { settingsStore } = useContext(rootStore);

    const endpointStatus = classnames({
        'status__subtitle--disabled': !settingsStore.displayEnabled,
        'status__subtitle--warning': settingsStore.displayEnabled && settingsStore.ping >= PING_WITH_WARNING,
        'status__subtitle--success': settingsStore.displayEnabled && settingsStore.ping < PING_WITH_WARNING,
    });

    const renderStatus = () => {
        if (!settingsStore.switcherEnabled) {
            return 'Connection is not secured';
        }
        if (settingsStore.ping) {
            return `Ping ${settingsStore.ping} ms`;
        }
        return 'Connecting...';
    };

    const renderTitle = () => {
        if (settingsStore.switcherEnabled) {
            return 'VPN is enabled';
        }

        return 'VPN is disabled';
    };

    return (
        <div className="status">
            <div className="status__title">
                {renderTitle()}
            </div>
            <div className={`status__subtitle ${endpointStatus}`}>
                {renderStatus()}
            </div>
        </div>
    );
});

export default Status;
