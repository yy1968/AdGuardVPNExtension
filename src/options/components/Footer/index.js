import React from 'react';

import { WEBSITE, DISCUSS, GITHUB } from '../../../background/config';
import './footer.pcss';

const getCurrentYear = () => new Date().getFullYear();

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer__inner">
                <div className="footer__copyright">
                    &copy; AdGuard, 2009–
                    {getCurrentYear()}
                </div>
                <nav className="footer__nav">
                    <a
                        href={WEBSITE}
                        className="footer__link"
                    >
                        Website
                    </a>
                    <a
                        href={DISCUSS}
                        className="footer__link"
                    >
                        Discuss
                    </a>
                    <a
                        href={GITHUB}
                        className="footer__link"
                    >
                        Github
                    </a>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
