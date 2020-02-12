import React, { useState } from 'react';
import classnames from 'classnames';

const INPUT_TYPES = {
    TEXT: 'text',
    PASSWORD: 'password',
};

function PasswordField({
    id, label, password, inputChangeHandler, error, autoFocus = true,
}) {
    const [inputType, setInputType] = useState('password');

    const handleInputTypeChange = () => {
        setInputType(inputType === INPUT_TYPES.PASSWORD ? INPUT_TYPES.TEXT : INPUT_TYPES.PASSWORD);
    };

    const icon = inputType === INPUT_TYPES.PASSWORD ? '#closed_eye' : '#open_eye';

    const inputClassName = classnames('form__input form__input--password', { 'form__input--error': error });

    return (
        <div className="form__item">
            <label className="form__label" htmlFor={id}>
                {label}
            </label>
            <input
                id={id}
                name={id}
                className={inputClassName}
                type={inputType}
                onChange={inputChangeHandler}
                value={password}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={autoFocus}
            />
            <button
                type="button"
                className="button form__show-password"
                onClick={handleInputTypeChange}
            >
                <svg className="icon icon--button">
                    <use xlinkHref={icon} />
                </svg>
            </button>
        </div>
    );
}

export default PasswordField;
