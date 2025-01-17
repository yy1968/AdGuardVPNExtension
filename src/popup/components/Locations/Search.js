/* eslint-disable jsx-a11y/no-autofocus */
import React from 'react';
import classnames from 'classnames';

import { reactTranslator } from '../../../common/reactTranslator';

const Search = ({ value, handleChange, handleClear }) => {
    const crossClassNames = classnames(
        'button button--close endpoints__cross',
        { 'endpoints__cross--active': value.length > 0 },
    );

    return (
        <div className="endpoints__search">
            <input
                autoFocus
                className="endpoints__search-in"
                type="text"
                placeholder={reactTranslator.getMessage('endpoints_search')}
                value={value}
                onChange={handleChange}
            />
            <button
                type="button"
                className={crossClassNames}
                onClick={handleClear}
            >
                <svg className="icon icon--button">
                    <use xlinkHref="#cross" />
                </svg>
            </button>
        </div>
    );
};

export default Search;
