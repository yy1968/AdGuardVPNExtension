import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import ReactHtmlParser from 'react-html-parser';

import rootStore from '../../../stores';
import { REQUEST_STATUSES } from '../../../stores/consts';

import PasswordField from '../PasswordField';
import Submit from '../Submit';

const RegistrationForm = observer(() => {
    const { authStore } = useContext(rootStore);

    const submitHandler = async (e) => {
        e.preventDefault();
        await authStore.register();
    };

    const inputChangeHandler = (e) => {
        const { target: { name, value } } = e;
        authStore.onCredentialsChange(name, value);
    };

    const { requestProcessState, credentials } = authStore;
    const { password, passwordAgain } = credentials;

    return (
        <form
            className="form"
            onSubmit={submitHandler}
        >
            <div className="form__inputs">
                <PasswordField
                    label="Password"
                    id="password"
                    inputChangeHandler={inputChangeHandler}
                    password={password}
                    error={authStore.error}
                />
                <PasswordField
                    label="Password confirmation"
                    id="passwordAgain"
                    inputChangeHandler={inputChangeHandler}
                    password={passwordAgain}
                    error={authStore.error}
                    autoFocus={false}
                />
                {authStore.error && (
                    <div className="form__error">
                        {ReactHtmlParser(authStore.error)}
                    </div>
                )}
            </div>
            <div className="form__btn-wrap">
                <Submit
                    text="Register"
                    processing={requestProcessState === REQUEST_STATUSES.PENDING}
                    disabled={authStore.disableRegister}
                />
            </div>
        </form>
    );
});

export default RegistrationForm;
