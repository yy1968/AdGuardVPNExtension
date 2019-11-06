import React, { useContext } from 'react';
import { observer } from 'mobx-react';

import rootStore from '../../../stores';
import Checkbox from '../Checkbox';

const Exclusions = observer(() => {
    const { settingsStore } = useContext(rootStore);
    const {
        exclusions,
    } = settingsStore;

    // const exclusionsArr = Object.keys(exclusions).map(host => exclusions[host]);
    console.log(exclusions);

    const removeFromExclusions = async (host) => {
        await settingsStore.removeFromExclusions(host);
    };

    const toggleExclusionHandler = id => async () => {
        await settingsStore.toggleExclusion(id);
    };

    return (
        <div className="settings__list">
            {exclusions.slice().reverse().map(({ id, hostname, enabled }) => (
                <div className="settings__list-item" key={id}>
                    <Checkbox
                        id={id}
                        label={hostname}
                        checked={enabled}
                        onChange={toggleExclusionHandler(id)}
                    />
                    <button
                        type="button"
                        className="button button--icon settings__list-remove"
                        onClick={() => removeFromExclusions(id)}
                    />
                </div>
            ))}
        </div>
    );
});

export default Exclusions;
