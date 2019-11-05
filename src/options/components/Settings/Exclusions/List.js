import React, { useContext } from 'react';
import { observer } from 'mobx-react';

import rootStore from '../../../stores';
import Checkbox from '../Checkbox';

const Exclusions = observer(() => {
    const { settingsStore } = useContext(rootStore);
    const {
        exclusions,
    } = settingsStore;

    const exclusionsArr = Object.keys(exclusions).map(host => exclusions[host]);

    const removeFromExclusions = async (host) => {
        await settingsStore.removeFromExclusions(host);
    };

    return (
        <div className="settings__list">
            {exclusionsArr.reverse().map(host => (
                <div className="settings__list-item" key={host}>
                    <Checkbox id={host} label={host} />
                    <button
                        type="button"
                        className="button button--icon settings__list-remove"
                        onClick={() => removeFromExclusions(host)}
                    />
                </div>
            ))}
        </div>
    );
});

export default Exclusions;
