import React, { Fragment, useContext } from 'react';
import browser from 'webextension-polyfill';
import { observer } from 'mobx-react';

import Form from './Form';
import List from './List';
import rootStore from '../../../stores';

const Exclusions = observer(() => {
    const { settingsStore } = useContext(rootStore);

    const {
        currentExclusionsType,
        toggleInverted,
    } = settingsStore;

    const onChange = type => async () => {
        await toggleInverted(type);
    };

    const messages = {
        [adguard.exclusions.TYPES.WHITELIST]: browser.i18n.getMessage('settings_exclusion_whitelist'),
        [adguard.exclusions.TYPES.BLACKLIST]: browser.i18n.getMessage('settings_exclusion_blacklist'),
    };

    const renderExclusions = (exclusionsType) => {
        const checked = exclusionsType === currentExclusionsType;

        return (
            <label className="settings__group">
                <div className="settings__subtitle">
                    <input type="radio" checked={checked} name="exclusions" onChange={onChange(exclusionsType)} />
                    {messages[exclusionsType]}
                </div>
                <Form exclusionsType={exclusionsType} />
                <List exclusionsType={exclusionsType} />
            </label>
        );
    };

    return (
        <Fragment>
            <div className="settings__section">
                <div className="settings__title">
                    {browser.i18n.getMessage('settings_exclusion_title')}
                </div>
                {renderExclusions(adguard.exclusions.TYPES.BLACKLIST)}
                {renderExclusions(adguard.exclusions.TYPES.WHITELIST)}
            </div>
        </Fragment>
    );
});

export default Exclusions;
