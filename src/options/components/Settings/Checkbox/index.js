import React from 'react';

import './checkbox.pcss';

const Checkbox = ({ id, label }) => {
    return (
        <div className="checkbox">
            <input
                id={id}
                name={id}
                type="checkbox"
                className="checkbox__input"
            />
            <label htmlFor={id} className="checkbox__label">
                {label}
            </label>
        </div>
    );
};

export default Checkbox;
