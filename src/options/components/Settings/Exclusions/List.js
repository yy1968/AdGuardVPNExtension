import React, { useContext } from 'react';
import { observer } from 'mobx-react';

import rootStore from '../../../stores';
import Checkbox from '../Checkbox';

const List = observer(({ exclusionsType }) => {
    const { settingsStore } = useContext(rootStore);

    const exclusions = settingsStore.exclusionsByType(exclusionsType);

    const handleRemove = id => async () => {
        await settingsStore.removeFromExclusions(exclusionsType, id);
    };

    const handleToggle = id => async () => {
        await settingsStore.toggleExclusion(exclusionsType, id);
    };

    const handleRename = id => async (name) => {
        await settingsStore.renameExclusion(exclusionsType, id, name);
    };

    return (
        <div className="settings__list">
            {exclusions.slice().reverse().map(({ id, hostname, enabled }) => (
                <div className="settings__list-item" key={id}>
                    <Checkbox
                        id={id}
                        label={hostname}
                        checked={enabled}
                        handleToggle={handleToggle(id)}
                        handleRename={handleRename(id)}
                        handleRemove={handleRemove(id)}
                    />
                </div>
            ))}
        </div>
    );
});

export default List;
