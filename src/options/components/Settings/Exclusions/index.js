import React, { Fragment } from 'react';

import Form from './Form';
import List from './List';

const Exclusions = () => (
    <Fragment>
        <div className="settings__section">
            <div className="settings__title">
                Exclusions:
            </div>
            <div className="settings__group">
                <div className="settings__subtitle">
                    Connect through VPN all sites expect of:
                </div>
                <Form />
                <List />
            </div>
        </div>
    </Fragment>
);

export default Exclusions;
