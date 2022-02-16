/* eslint-disable jsx-a11y/media-has-caption */
import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import Lottie from 'lottie-react';

import { rootStore } from '../../stores';

import GlobalControl from './GlobalControl';
import Status from './Status';
import { TrafficLimitExceeded } from './TrafficLimitExceeded';
import on from '../../../assets/lottie/on.json';
import off from '../../../assets/lottie/off.json';
import './settings.pcss';

const Settings = observer(() => {
    const { settingsStore, vpnStore } = useContext(rootStore);

    const {
        isConnected,
        hasLimitExceededError,
    } = settingsStore;

    const {
        premiumPromoEnabled,
        isPremiumToken,
    } = vpnStore;

    const settingsClass = classnames(
        'settings',
        { 'settings--active': isConnected },
        { 'settings--premium-promo': premiumPromoEnabled },
        { 'settings--trial': !isPremiumToken },
        { 'settings--feedback': !premiumPromoEnabled },
    );

    if (hasLimitExceededError) {
        return (
            <TrafficLimitExceeded />
        );
    }

    return (
        <div className={settingsClass}>
            {/* <div className="settings__pic" />
            <div className="settings__animation settings__animation--hidden">
                {isConnected
                    ? <Lottie animationData={on} />
                    : <Lottie animationData={off} loop />}
            </div> */}
            {/* <div className="settings__animation">
                {isConnected
                    ? <Lottie animationData={on} />
                    : <Lottie animationData={off} loop />}
            </div> */}
            {/* <video autoPlay loop={!isConnected} className="settings__video">
                <source src="../../../assets/videos/off.mp4" />
            </video> */}
            {!isConnected && (
                <video autoPlay loop className="settings__video">
                    <source src="../../../assets/videos/off.mp4" />
                </video>
            )}
            {isConnected && (
                <video autoPlay className="settings__video">
                    <source src="../../../assets/videos/on.mp4" />
                </video>
            )}
            <div className="settings__main">
                <Status />
                <GlobalControl />
            </div>
        </div>
    );
});

export default Settings;
