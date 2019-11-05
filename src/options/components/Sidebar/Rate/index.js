import React, { Fragment } from 'react';
import { observer } from 'mobx-react';

import { STORE_URL } from '../../../../background/config';
import './rate.pcss';

const RATING_STARS = [1, 2, 3, 4, 5];

const Rate = observer(() => {
    const handleClick = () => {
        // TODO tds link
        window.open('https://adguard.com/forward.html?action=store&from=options_screen_rate&app=vpn_extension', '_blank');
    };

    const hideRate = () => {
        console.log('hide');
    };

    return (
        <div className="rate">
            <div className="rate__text">
                Hey, we are a team from AdGuard and it is very important
                for us to know your opinion about our product. Please rate it.
            </div>
            <div className="rate__stars">
                {RATING_STARS.map(star => (
                    <Fragment key={star}>
                        <input
                            type="radio"
                            value={star}
                            name="rating"
                            id={`rating-${star}`}
                            className="rate__input"
                        />
                        <label
                            htmlFor={`rating-${star}`}
                            className="rate__star"
                            onClick={handleClick}
                        />
                    </Fragment>
                ))}
            </div>
            {/* TODO hide after rate block after click */}
            <button
                type="button"
                className="rate__hide"
                onClick={hideRate}
            >
                Hide
            </button>
        </div>
    );
});

export default Rate;
