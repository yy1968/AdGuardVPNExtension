import React, { useContext } from 'react';
import { observer } from 'mobx-react';

import rootStore from '../../stores';
import Endpoint from './Endpoint';
import Search from './Search';

import './endpoints.pcss';

const Endpoints = observer(() => {
    const { vpnStore, uiStore, settingsStore } = useContext(rootStore);

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
        } = endpoint;

        return (
            <Endpoint
                key={id}
                id={id}
                handleClick={handleEndpointSelect}
                selected={selected}
                countryCode={countryCode}
                name={`${countryName}, ${cityName}`}
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

    const endpoints = vpnStore.filteredEndpoints;

    return (
        <div className="endpoints">
            <div className="endpoints__header">
                Countries

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
                <div className="endpoints__list">
                    <div className="endpoints__title">
                        History
                    </div>
                    {/* TODO */}
                </div>

                <div className="endpoints__list">
                    <div className="endpoints__title">
                        Fastest
                    </div>
                    {/* TODO */}
                </div>

                <div className="endpoints__list">
                    <div className="endpoints__title">
                        All endpoints
                    </div>

                    {renderEndpoints(endpoints)}
                </div>
            </div>
        </div>
    );
});

export default Endpoints;
