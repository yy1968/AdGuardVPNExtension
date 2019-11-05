import React, { Fragment, useContext } from 'react';
import { observer } from 'mobx-react';
import rootStore from '../../stores';

import { EDIT_ACCOUNT } from '../../../background/config';
import './account.pcss';

const Account = observer(() => {
    const { authStore } = useContext(rootStore);

    const signOut = async () => {
        await authStore.deauthenticate();
    };

    return (
        <Fragment>
            <h2 className="content__title">
                Account
            </h2>
            <div className="account">
                <div className="account__email">
                    {/* TODO get current email */}
                    ouomuo@gmail.com
                </div>

                <div className="account__actions">
                    <a
                        href={EDIT_ACCOUNT}
                        className="button button--medium button--outline-primary account__action"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Edit
                    </a>

                    <button
                        type="button"
                        className="button button--medium button--outline-secondary account__action"
                        onClick={signOut}
                    >
                        Sing out
                    </button>
                </div>
            </div>
        </Fragment>
    );
});

export default Account;
