import React, { Fragment } from 'react';
import { Markers, Marker } from 'react-simple-maps';
import SignalsAnimation from './SignalsAnimation';
import COLORS from './colors';

const renderCityMarkers = (endpoints, selectedEndpoint, globalProxyEnabled, onMarkerClicked) => {
    if (!endpoints) {
        return null;
    }

    const markers = Object.values(endpoints).map((endpoint) => {
        const { coordinates } = endpoint;
        if (coordinates) {
            return endpoint;
        }
        return null;
    }).filter(i => i);

    if (!markers) {
        return null;
    }

    /**
     * Checks if is same marker
     * if not to check id and cityName, then selected endpoint blinks on map while reconnected
     * @param marker
     * @param selectedEndpoint
     * @returns {boolean}
     */
    const isSelectedEndpointMarker = (marker, selectedEndpoint) => {
        return marker.id === selectedEndpoint.id
            || marker.cityName === selectedEndpoint.cityName;
    };

    const renderCityName = (marker, selectedEndpoint) => {
        if (!selectedEndpoint) {
            return '';
        }
        if (isSelectedEndpointMarker(marker, selectedEndpoint)) {
            return (
                <text
                    textAnchor="middle"
                    y="25px"
                    style={{
                        fontSize: '12px',
                        fontFamily: 'Akkurat, sans-serif',
                        fontWeight: '700',
                        fill: globalProxyEnabled ? COLORS.ENABLED_TEXT : COLORS.DISABLED_TEXT,
                    }}
                >
                    {selectedEndpoint.cityName}
                </text>
            );
        }
        return '';
    };

    return (
        <Markers>
            {markers.map(marker => (
                <Marker
                    key={marker.id}
                    marker={marker}
                    style={{
                        hidden: { display: 'none' },
                    }}
                    onClick={onMarkerClicked}
                >
                    {
                        selectedEndpoint
                        && isSelectedEndpointMarker(marker, selectedEndpoint) ? (
                            <Fragment>
                                <circle
                                    cx={0}
                                    cy={0}
                                    r={10}
                                    fill={globalProxyEnabled
                                        ? COLORS.SELECTED_ENABLED_MARKER
                                        : COLORS.SELECTED_DISABLED_MARKER}
                                />
                                <circle
                                    cx={0}
                                    cy={0}
                                    r={4}
                                    fill="#F0F0F0"
                                />
                                <SignalsAnimation />
                            </Fragment>
                            )
                            : (
                                <Fragment>
                                    <circle
                                        cx={0}
                                        cy={0}
                                        r={8}
                                        fill={globalProxyEnabled
                                            ? COLORS.ENABLED_MARKER_02
                                            : COLORS.DISABLED_MARKER}
                                    />
                                    <circle
                                        cx={0}
                                        cy={0}
                                        r={4}
                                        fill={globalProxyEnabled
                                            ? COLORS.ENABLED_MARKER_05
                                            : COLORS.DISABLED_MARKER}
                                    />
                                </Fragment>
                            )
                    }
                    {renderCityName(marker, selectedEndpoint)}
                </Marker>
            ))}
        </Markers>
    );
};

export default renderCityMarkers;
