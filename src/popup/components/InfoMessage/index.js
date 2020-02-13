import React, { useContext } from 'react';
import { observer } from 'mobx-react';

import rootStore from '../../stores';
import popupActions from '../../actions/popupActions';

import './info-message.pcss';

const TRAFFIC_PERCENT = {
    DANGER: 25,
    WARNING: 50,
};

const InfoMessage = observer(() => {
    const { vpnStore } = useContext(rootStore);

    const onClick = (url) => (e) => {
        e.preventDefault();
        popupActions.openTab(url);
    };

    const {
        premiumPromoEnabled, premiumPromoPage, remainingTraffic, totalTraffic,
    } = vpnStore;

    if (!premiumPromoEnabled) {
        return null;
    }

    const progressPercent = Math.floor((remainingTraffic / totalTraffic) * 100);

    const getInfoColor = () => {
        if (progressPercent < TRAFFIC_PERCENT.DANGER) {
            return 'red';
        }

        if (progressPercent < TRAFFIC_PERCENT.WARNING) {
            return 'yellow';
        }

        return 'green';
    };

    return (
        <div className="info-message">
            <div className="info-message__text">
                <span className={`info-message__value ${getInfoColor()}`}>
                    {remainingTraffic}
                    &nbsp;MB
                </span>
                &nbsp;remaining this month
            </div>
            <a
                href={premiumPromoPage}
                type="button"
                className="button button--medium button--red-gradient info-message__btn"
                onClick={onClick(premiumPromoPage)}
            >
                Upgrade
            </a>
            <div className="info-message__progress">
                <div
                    className={`info-message__progress-in ${getInfoColor()}`}
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
});

export default InfoMessage;
