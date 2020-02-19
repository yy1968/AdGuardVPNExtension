import React from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';

const PING_WITH_WARNING = 100;

const Endpoint = observer(({
    id, selected, countryCode, name, handleClick, ping,
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

    const pingClassName = classnames(
        'endpoints__ping',
        { 'endpoints__ping--warning': ping >= PING_WITH_WARNING },
        { 'endpoints__ping--success': ping < PING_WITH_WARNING }
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
            <div className={pingClassName}>
                {ping ? (
                    <span>
                        {ping}
                        &nbsp;ms
                    </span>
                ) : (
                    <span>...</span>
                )}
            </div>
        </button>
    );
});

export default Endpoint;
