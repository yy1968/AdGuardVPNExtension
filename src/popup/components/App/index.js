import React, {
    Fragment,
    useContext,
    useEffect,
} from 'react';
import { observer } from 'mobx-react';
import Modal from 'react-modal';
import browser from 'webextension-polyfill';
import { toJS } from 'mobx';
import { CSSTransition } from 'react-transition-group';

import Header from '../Header';
import MapContainer from '../MapContainer';
import InfoMessage from '../InfoMessage';
import Endpoints from '../Endpoints';
import Authentication from '../Authentication';
import ExtraOptions from '../ExtraOptions';
import Preloader from '../Preloader';
import Stats from '../Stats';
import GlobalError from '../GlobalError';
import Settings from '../Settings';
import Icons from '../ui/Icons';

import rootStore from '../../stores';
import { REQUEST_STATUSES } from '../../stores/consts';
import { MESSAGES_TYPES } from '../../../lib/constants';
import log from '../../../lib/logger';

// Set modal app element in the app module because we use multiple modal
Modal.setAppElement('#root');

const App = observer(() => {
    const {
        settingsStore,
        authStore,
        uiStore,
        vpnStore,
        globalStore,
    } = useContext(rootStore);

    useEffect(() => {
        (async () => {
            await globalStore.init();
        })();

        const messageHandler = async (message) => {
            const { type, data } = message;

            switch (type) {
                case MESSAGES_TYPES.VPN_INFO_UPDATED: {
                    vpnStore.setVpnInfo(data);
                    break;
                }
                case MESSAGES_TYPES.ENDPOINTS_UPDATED: {
                    vpnStore.setEndpoints(data);
                    break;
                }
                case MESSAGES_TYPES.CURRENT_ENDPOINT_UPDATED: {
                    vpnStore.setSelectedEndpoint(data);
                    break;
                }
                case MESSAGES_TYPES.PERMISSIONS_UPDATE_ERROR:
                case MESSAGES_TYPES.VPN_TOKEN_NOT_FOUND: {
                    settingsStore.setGlobalError(data);
                    break;
                }
                default: {
                    log.debug('there is no such message type: ', type);
                    break;
                }
            }
        };

        browser.runtime.onMessage.addListener(messageHandler);

        return () => {
            browser.runtime.onMessage.removeListener(messageHandler);
        };
    }, []);

    const { status } = globalStore;

    // show nothing while data is loading
    if (status === REQUEST_STATUSES.PENDING) {
        return null;
    }

    const { requestProcessState, authenticated } = authStore;

    if (!authenticated) {
        return (
            <Fragment>
                {requestProcessState === REQUEST_STATUSES.PENDING
                && <Preloader isOpen={requestProcessState === REQUEST_STATUSES.PENDING} />
                }
                <Header authenticated={authenticated} />
                <Authentication />
                <Icons />
            </Fragment>
        );
    }

    const { canControlProxy, globalError, checkPermissionsState } = settingsStore;
    const { isOpenEndpointsSearch, isOpenOptionsModal } = uiStore;

    if (globalError) {
        console.log('global error', toJS(globalError));
        console.log({ checkPermissionsState });
        return (
            <Fragment>
                {checkPermissionsState === REQUEST_STATUSES.PENDING
                && <Preloader isOpen={checkPermissionsState === REQUEST_STATUSES.PENDING} />
                }
                {isOpenOptionsModal && <ExtraOptions />}
                <Header authenticated={authenticated} />
                <GlobalError />
            </Fragment>
        );
    }

    const showWarning = !canControlProxy;

    return (
        <Fragment>
            {isOpenOptionsModal && <ExtraOptions />}
            <Header authenticated={authenticated} />
            <CSSTransition
                in={isOpenEndpointsSearch}
                timeout={300}
                classNames="fade"
                unmountOnExit
            >
                <Endpoints />
            </CSSTransition>
            <MapContainer />
            <Settings />
            <div className="footer">
                {!showWarning && <Stats />}
                {!showWarning && <InfoMessage />}
            </div>
            <Icons />
        </Fragment>
    );
});

export default App;
