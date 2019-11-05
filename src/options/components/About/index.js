import React, { Fragment, useContext } from 'react';
import { observer } from 'mobx-react';
import browser from 'webextension-polyfill';
import rootStore from '../../stores';

import './about.pcss';

const About = observer(() => {
    const { settingsStore } = useContext(rootStore);

    const aboutVersionStr = `${browser.i18n.getMessage('name')} ${settingsStore.appVersion}`;
    return (
        <Fragment>
            <h2 className="content__title">
                About
            </h2>
            <div className="about">
                {/* TODO get current version */}
                <div className="about__version">
                    {aboutVersionStr}
                </div>

                {/* TODO get content for description */}
                <div className="about__description">
                    Hey, we are a team from AdGuard and it is very important for us
                    to know your opinion about our product. Please rate it.
                </div>
            </div>
        </Fragment>
    );
});

export default About;
