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
                    We are the team of experienced specialists from
                    Adguard Software Limited — an IT company
                    that develops a range of AdGuard software products for internet filtering.
                    We are not just creators of AdGuard, but rather
                    jedi of the light side of the Internet.
                </div>
            </div>
        </Fragment>
    );
});

export default About;
