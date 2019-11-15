import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import ReactHtmlParser from 'react-html-parser';
import browser from 'webextension-polyfill';

import rootStore from '../../../stores';

const RegistrationForm = observer(() => {
    const { authStore } = useContext(rootStore);
    const {
        error, field, credentials, disableRegister,
    } = authStore;
    const {
        username, password, passwordAgain,
    } = credentials;

    const submitHandler = async (e) => {
        e.preventDefault();
        await authStore.register();
    };

    const inputChangeHandler = (e) => {
        const { target: { name, value } } = e;
        authStore.onCredentialsChange(name, value);
    };

    const handleLoginClick = () => {
        authStore.showSignIn();
    };

    return (
        <form className="form" onSubmit={submitHandler}>
            <div className="form__inputs">
                <div className={`form__item ${error && (field === 'username' || field === '') ? 'form__item--error' : ''}`}>
                    <label className="form__label" htmlFor="username">
                        {browser.i18n.getMessage('auth_email')}
                    </label>
                    <input
                        id="username"
                        className="form__input"
                        type="text"
                        name="username"
                        placeholder="example@mail.com"
                        value={username}
                        onChange={inputChangeHandler}
                    />
                </div>
                <div className={`form__item ${error && field === 'password' ? 'form__item--error' : ''}`}>
                    <div className="form__item-header">
                        <label className="form__label" htmlFor="password">
                            {browser.i18n.getMessage('auth_password')}
                        </label>
                    </div>
                    <input
                        id="password"
                        className="form__input"
                        type="password"
                        name="password"
                        onChange={inputChangeHandler}
                        value={password}
                    />
                </div>
                <div className="form__item">
                    <div className="form__item-header">
                        <label className="form__label" htmlFor="passwordAgain">
                            {browser.i18n.getMessage('auth_password_repeat')}
                        </label>
                    </div>
                    <input
                        id="passwordAgain"
                        className="form__input"
                        type="password"
                        name="passwordAgain"
                        onChange={inputChangeHandler}
                        value={passwordAgain}
                    />
                </div>
                {error && (
                    <div className="form__error">
                        {ReactHtmlParser(error)}
                    </div>
                )}
            </div>

            <div className="form__actions">
                <button
                    type="submit"
                    className="button button--primary button--medium button--block"
                    disabled={disableRegister}
                >
                    {browser.i18n.getMessage('auth_register')}
                </button>

                <div className="form__text form__text--register">
                    <button
                        type="button"
                        className="button button--link form__link form__link--login"
                        onClick={handleLoginClick}
                    >
                        {browser.i18n.getMessage('auth_login')}
                    </button>
                </div>
            </div>
        </form>
    );
});

export default RegistrationForm;
