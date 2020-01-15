import React, { useContext, useRef, Fragment } from 'react';
import { observer } from 'mobx-react';
import browser from 'webextension-polyfill';
import classnames from 'classnames';

import useOutsideClick from '../../helpers/useOutsideClick';
import rootStore from '../../../stores';
import Popover from '../../ui/Popover';

const Form = observer(({ exclusionsType, enabled }) => {
    const ref = useRef();
    const { settingsStore } = useContext(rootStore);
    const {
        areFormsVisible,
        exclusionsInputs,
        addToExclusions,
        onExclusionsInputChange,
        openExclusionsForm,
        closeExclusionsForm,
    } = settingsStore;

    const isFormVisible = areFormsVisible[exclusionsType];
    const exclusionInput = exclusionsInputs[exclusionsType];

    const submitHandler = async (e) => {
        e.preventDefault();
        await addToExclusions(exclusionsType);
    };

    const inputChangeHandler = (e) => {
        const { target: { value } } = e;
        onExclusionsInputChange(exclusionsType, value);
    };

    const openForm = () => {
        openExclusionsForm(exclusionsType);
    };

    useOutsideClick(ref, () => {
        closeExclusionsForm(exclusionsType);
    });

    const formClassName = classnames('settings__form', { 'settings__form--hidden': !enabled });

    return (
        <div className={formClassName} ref={ref}>
            <button
                type="button"
                className="button button--icon button--medium settings__add"
                onClick={openForm}
            >
                <svg className="icon icon--button icon--checked settings__add-icon">
                    <use xlinkHref="#plus" />
                </svg>
                {browser.i18n.getMessage('settings_exclusion_add')}
            </button>

            {isFormVisible && (
                <div className="settings__list-item settings__list-item--active">
                    <form
                        onSubmit={submitHandler}
                        className="form"
                    >
                        <div className="checkbox checkbox--disabled">
                            <input
                                id="newHostname"
                                type="checkbox"
                                className="checkbox__input"
                                checked
                                readOnly
                            />
                            <label htmlFor="newHostname" className="checkbox__label checkbox__label--disabled">
                                <svg className="icon icon--button icon--checked">
                                    <use xlinkHref="#checked" />
                                </svg>
                            </label>
                            <input
                                type="text"
                                className="form__input form__input--transparent"
                                onChange={inputChangeHandler}
                                value={exclusionInput}
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                            />
                            <Popover>
                                <Fragment>
                                    <div className="popover__title">
                                        {browser.i18n.getMessage('settings_exclusion_subdomains_title')}
                                    </div>
                                    <div className="popover__text">
                                        {browser.i18n.getMessage('settings_exclusion_subdomains_description')}
                                    </div>
                                </Fragment>
                            </Popover>
                            {exclusionInput ? (
                                <button
                                    type="submit"
                                    className="button button--icon form__submit form__submit--icon"
                                >
                                    <svg className="icon icon--button icon--check">
                                        <use xlinkHref="#check" />
                                    </svg>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="button button--icon checkbox__button"
                                    onClick={() => closeExclusionsForm(exclusionsType)}
                                >
                                    <svg className="icon icon--button icon--cross">
                                        <use xlinkHref="#cross" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
});

export default Form;
