import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import rootStore from '../../stores';
import './stats.pcss';

const Stats = observer(() => {
    const { settingsStore } = useContext(rootStore);

    const updateStats = () => {
        const UPDATE_INTERVAL = 1000;
        // first time run immediately;
        settingsStore.getProxyStats();

        // next time once per second
        const intervalId = setInterval(async () => {
            await settingsStore.getProxyStats();
        }, UPDATE_INTERVAL);

        const onUnmount = () => {
            clearInterval(intervalId);
        };

        return onUnmount;
    };

    useEffect(() => {
        return updateStats();
    }, []);

    const { mbytesDownloaded, mbytesUploaded } = settingsStore.stats;
    return (
        <div className="stats">
            <div className="stats__col">
                <div className="stats__value">
                    {mbytesDownloaded}
                </div>
                <div className="stats__units">
                    Downloaded, MB
                </div>
            </div>
            <div className="stats__col">
                <div className="stats__value">
                    {mbytesUploaded}
                </div>
                <div className="stats__units">
                    Uploaded, MB
                </div>
            </div>
        </div>
    );
});

export default Stats;
