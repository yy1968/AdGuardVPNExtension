import React from 'react';
import browser from 'webextension-polyfill';

import Mode from './Mode';
import './settings.pcss';
import '../ui/radio.pcss';

const Settings = () => (
    <>
        <h2 className="content__title">
            {browser.i18n.getMessage('settings_exclusion_title')}
        </h2>
        <div className="settings">
            <Mode />
        </div>
    </>
);

export default Settings;
