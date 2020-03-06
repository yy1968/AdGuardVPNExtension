/* eslint-disable import/no-mutable-exports */
// TODO [maximtop] check that webpack handles mutable exports without problems
export let credentials;
export let permissionsChecker;
export let popupData;
export let endpoints;

export const initialize = (services) => {
    credentials = services.credentials;
    permissionsChecker = services.permissionsChecker;
    popupData = services.popupData;
    endpoints = services.endpoints;
};
