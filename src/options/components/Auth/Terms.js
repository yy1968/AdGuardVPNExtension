import React, { Fragment } from 'react';

import { EULA_URL, PRIVACY_URL } from '../../../background/config';

const Terms = () => (
    <Fragment>
        <div className="auth__terms">
            By continuing you accept the&nbsp;
            <div>
                <a
                    href={PRIVACY_URL}
                    type="button"
                    className="auth__term"
                >
                    Terms and Conditions
                </a>
                &nbsp;and&nbsp;
                <a
                    href={EULA_URL}
                    type="button"
                    className="auth__term"
                >
                    EULA
                </a>
            </div>
        </div>
    </Fragment>
);

export default Terms;
