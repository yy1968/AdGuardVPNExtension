import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react';

import translator from '../../../lib/translator';
import rootStore from '../../stores';
import Endpoint from './Endpoint';
import Search from './Search';

import './endpoints.pcss';

const Endpoints = observer(() => {
    const { vpnStore, uiStore, settingsStore } = useContext(rootStore);

    useEffect(() => {
        (async () => {
            await vpnStore.requestFastestEndpoints();
        })();
    }, []);

    const handleEndpointSelect = (id) => async (e) => {
        e.preventDefault();
        const prevId = vpnStore.selectedEndpoint.id;
        await vpnStore.selectEndpoint(id);
        uiStore.closeEndpointsSearch();
        if (settingsStore.proxyEnabled && prevId !== vpnStore.selectedEndpoint.id) {
            await settingsStore.reconnectProxy();
            return;
        }
        if (!settingsStore.proxyEnabled) {
            await settingsStore.setProxyState(true);
        }
    };

    const handleCloseEndpoints = () => {
        uiStore.closeEndpointsSearch();
        vpnStore.setSearchValue('');
    };

    const renderEndpoints = (endpoints) => endpoints.map((endpoint) => {
        const {
            id,
            countryName,
            selected,
            cityName,
            countryCode,
            ping,
        } = endpoint;

        return (
            <Endpoint
                key={id}
                id={id}
                handleClick={handleEndpointSelect}
                selected={selected}
                countryCode={countryCode}
                name={`${countryName}, ${cityName}`}
                ping={ping}
            />
        );
    });

    const handleSearchInput = (e) => {
        const { value } = e.target;
        vpnStore.setSearchValue(value);
    };

    const handleSearchClear = () => {
        vpnStore.setSearchValue('');
    };

    const { fastestEndpoints, historyEndpoints, filteredEndpoints } = vpnStore;

    return (
        <div className="endpoints">
            <div className="endpoints__header">
                {translator.translate('endpoints_countries')}

                <button
                    type="button"
                    className="button endpoints__back"
                    onClick={handleCloseEndpoints}
                >
                    <svg className="icon icon--button">
                        <use xlinkHref="#back" />
                    </svg>
                </button>
            </div>
            <Search
                value={vpnStore.searchValue}
                handleChange={handleSearchInput}
                handleClear={handleSearchClear}
            />
            <div className="endpoints__scroll">
                {historyEndpoints.length > 0 && (
                    <div className="endpoints__list">
                        <div className="endpoints__title">
                            {translator.translate('endpoints_history')}
                        </div>
                        {renderEndpoints(historyEndpoints)}
                    </div>
                )}

                {fastestEndpoints.length > 0 && (
                    <div className="endpoints__list">
                        <div className="endpoints__title">
                            {translator.translate('endpoints_fastest')}
                        </div>
                        {renderEndpoints(fastestEndpoints)}
                    </div>
                )}

                <div className="endpoints__list">
                    <div className="endpoints__title">
                        {translator.translate('endpoints_all')}
                    </div>
                    {renderEndpoints(filteredEndpoints)}
                </div>
            </div>
        </div>
    );
});

export default Endpoints;
