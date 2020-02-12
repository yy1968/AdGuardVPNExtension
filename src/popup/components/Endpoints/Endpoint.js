import React from 'react';
import classnames from 'classnames';

const Endpoint = ({
    id, selected, countryCode, name, handleClick,
}) => {
    const getEndpointIcon = (selected, countryCode) => {
        const icon = (countryCode && countryCode.toLowerCase()) || '';
        const flagClass = classnames(
            'flag flag--small',
            { 'flag--active': selected }
        );

        return (
            <div className={flagClass}>
                <span className={`flag__icon flag__icon--${icon}`} />
            </div>
        );
    };

    const endpointClassName = classnames(
        'endpoints__item',
        { 'endpoints__item--selected': selected }
    );

    return (
        <button
            type="button"
            className={endpointClassName}
            onClick={handleClick(id)}
        >
            <div className="endpoints__icon">
                {getEndpointIcon(selected, countryCode)}
            </div>
            <div className="endpoints__city">
                {name}
            </div>
            <div className="endpoints__ping">
                ...
            </div>
        </button>
    );
};

export default Endpoint;
