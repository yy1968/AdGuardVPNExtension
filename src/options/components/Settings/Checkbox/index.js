import React from 'react';

import './checkbox.pcss';

const Checkbox = ({
    id,
    label,
    checked,
    onChange,
}) => {
    return (
        <div className="checkbox">
            <input
                id={id}
                name={id}
                type="checkbox"
                className="checkbox__input"
                checked={checked}
                onChange={onChange}
            />
            <label htmlFor={id} className="checkbox__label">
                {label}
            </label>
        </div>
    );
};

export default Checkbox;
