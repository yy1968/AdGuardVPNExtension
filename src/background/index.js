import settings from './settings';
import actions from './actions';
import { vpnApi } from './api';
import tabs from './tabs';
import exclusions from './exclusions';
import auth from './auth';
import { proxy } from './proxy';
import connectivity from './connectivity/connectivity';
import appStatus from './appStatus';
import tabsContext from './tabsContext';
import authCache from './authentication/authCache';
import messaging from './messaging';
import vpn from './vpn';
import popupData from './popupData';
import credentials from './credentials';
import permissionsUpdater from './permissionsUpdater';

global.adguard = {
    settings,
    actions,
    proxy,
    vpnApi,
    tabs,
    exclusions,
    auth,
    connectivity,
    appStatus,
    tabsContext,
    authCache,
    vpn,
    popupData,
    credentials,
};

// init credentials
credentials.init();

// init messaging
messaging.init();

// TODO [maximtop] consider if it can be useful to have some method indicate
//  that all modules are ready
// init exclusions
exclusions.init();

// init tokens updater
permissionsUpdater.init();
