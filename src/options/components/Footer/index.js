import React from 'react';

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
                    {/* TODO tds links */}
                    <a
                        href="https://adguard.com/forward.html?action=adguard_site&from=options_screen_footer&app=vpn_extension"
                        className="footer__link"
                    >
                        Website
                    </a>
                    <a
                        href="https://adguard.com/forward.html?action=discuss&from=options_screen_footer&app=vpn_extension"
                        className="footer__link"
                    >
                        Discuss
                    </a>
                    <a
                        href="https://adguard.com/forward.html?action=github&from=options_screen_footer&app=vpn_extension"
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
