import React from 'react';
import browser from 'webextension-polyfill';

import WebRTC from './WebRTC';

const Settings = () => (
    <>
        <h2 className="content__title">
            {browser.i18n.getMessage('settings_title')}
        </h2>
        <div className="settings">
            <WebRTC />
        </div>
    </>
);

export default Settings;
