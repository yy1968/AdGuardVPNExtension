import React, { Fragment } from 'react';

import './about.pcss';

const About = () => {
    return (
        <Fragment>
            <h2 className="content__title">
                About
            </h2>
            <div className="about">
                {/* TODO get current version */}
                <div className="about__version">
                    AdGuard VPN v.0.01.11
                </div>

                {/* TODO get content for description */}
                <div className="about__description">
                    Hey, we are a team from AdGuard and it is very important for us
                    to know your opinion about our product. Please rate it.
                </div>
            </div>
        </Fragment>
    );
};

export default About;
