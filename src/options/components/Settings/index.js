import React, { Fragment } from 'react';

import Exclusions from './Exclusions';
import './settings.pcss';

const Settings = () => (
    <Fragment>
        <h2 className="content__title">
            Settings
        </h2>
        <div className="settings">
            <Exclusions />
        </div>
    </Fragment>
);

export default Settings;
