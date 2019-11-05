import React from 'react';

import { WEBSITE_URL, EULA_URL, PRIVACY_URL } from '../../../background/config';
import './footer.pcss';

const getCurrentYear = () => new Date().getFullYear();

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer__inner">
                <a href={WEBSITE_URL} className="footer__copyright">
                    &copy; AdGuard, 2009–
                    {getCurrentYear()}
                </a>
                <nav className="footer__nav">
                    <a
                        href={EULA_URL}
                        className="footer__link"
                    >
                        EULA
                    </a>
                    <a
                        href={PRIVACY_URL}
                        className="footer__link"
                    >
                        Privacy policy
                    </a>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
