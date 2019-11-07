import React, { useState } from 'react';

import './checkbox.pcss';

const Checkbox = ({
    id,
    label,
    checked,
    handleToggle,
    handleRename,
    handleRemove,
}) => {
    const [hostname, setHostname] = useState(label);
    const isEdited = label !== hostname;

    // TODO remove focus after sumbit ?
    const handleSubmit = (e) => {
        e.preventDefault();
        handleRename(hostname);
    };

    return (
        <form className="form" onSubmit={handleSubmit}>
            <div className="checkbox">
                <input
                    id={id}
                    name={id}
                    type="checkbox"
                    className="checkbox__input"
                    checked={checked}
                    onChange={handleToggle}
                />
                <label htmlFor={id} className="checkbox__label" />
                <input
                    type="text"
                    name="hostname"
                    className="form__input form__input--transparent checkbox__edit"
                    onChange={e => setHostname(e.target.value)}
                    value={hostname}
                />
                {isEdited ? (
                    <button
                        type="submit"
                        className="button button--icon checkbox__button"
                        disabled={!hostname}
                    >
                        <svg className="icon icon--button icon--check">
                            <use xlinkHref="#check" />
                        </svg>
                    </button>
                ) : (
                    <button
                        type="button"
                        className="button button--icon checkbox__button"
                        onClick={handleRemove}
                    >
                        <svg className="icon icon--button icon--cross">
                            <use xlinkHref="#cross" />
                        </svg>
                    </button>
                )}
            </div>
        </form>
    );
};

export default Checkbox;
