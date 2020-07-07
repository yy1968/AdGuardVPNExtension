/**
 * NOTICE, do not keep here any program logic, because this file is used on popup also
 */

/**
 * Possible events for connectivity finite state machine
 */
export const EVENT = {
    CONNECT_BTN_PRESSED: 'CONNECT_BTN_PRESSED',
    DISCONNECT_BTN_PRESSED: 'DISCONNECT_BTN_PRESSED',
    CONNECT_SETTINGS_APPLY: 'CONNECT_SETTINGS_APPLY',
    CONNECTION_SUCCESS: 'CONNECTION_SUCCESS',
    CONNECTION_FAIL: 'CONNECTION_FAIL',
    WS_ERROR: 'WS_ERROR',
    WS_CLOSE: 'WS_CLOSE',
    NETWORK_ONLINE: 'NETWORK_ONLINE',
    DISCONNECT_TRAFFIC_LIMIT_EXCEEDED: 'DISCONNECT_TRAFFIC_LIMIT_EXCEEDED',
};

/**
 * States of connectivity finite state machine
 */
export const STATE = {
    DISCONNECTED_IDLE: 'disconnectedIdle',
    DISCONNECTED_RETRYING: 'disconnectedRetrying',
    CONNECTING_IDLE: 'connectingIdle',
    CONNECTING_RETRYING: 'connectingRetrying',
    CONNECTED: 'connected',
};

/**
 * Connection shouldn't be less than specified time
 * @type {number}
 */
export const MIN_CONNECTION_DURATION_MS = 500;