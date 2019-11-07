import React, { Fragment, useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import browser from 'webextension-polyfill';
import Modal from 'react-modal';

import log from '../../../lib/logger';
import { MESSAGES_TYPES } from '../../../lib/constants';
import { REQUEST_STATUSES } from '../../stores/consts';

import '../../styles/main.pcss';
import './app.pcss';

import rootStore from '../../stores';
import Sidebar from '../Sidebar';
import Footer from '../Footer';
import Settings from '../Settings';
import Account from '../Account';
import About from '../About';
import Auth from '../Auth';
import Preloader from '../Preloader';
import Icons from '../ui/Icons';

Modal.setAppElement('#root');

const getContent = (authenticated, requestProcessState) => {
    if (authenticated) {
        return (
            <div className="container">
                <div className="wrapper">
                    <Sidebar />
                    <div className="content">
                        <Switch>
                            <Route path="/" exact component={Settings} />
                            <Route path="/account" component={Account} />
                            <Route path="/about" component={About} />
                            <Route component={Settings} />
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Fragment>
            {requestProcessState === REQUEST_STATUSES.PENDING && <Preloader />}
            <Auth />
        </Fragment>
    );
};

const App = observer(() => {
    const {
        authStore,
        settingsStore,
    } = useContext(rootStore);

    useEffect(() => {
        (async () => {
            authStore.isAuthenticated();
            settingsStore.getExclusions();
            settingsStore.getVersion();
            settingsStore.getUsername();
            settingsStore.checkRateStatus();
        })();

        const messageHandler = async (message) => {
            const { type } = message;

            switch (type) {
                case MESSAGES_TYPES.EXCLUSION_UPDATED: {
                    settingsStore.getExclusions();
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

    const { authenticated, requestProcessState } = authStore;

    return (
        <HashRouter hashType="noslash">
            {getContent(authenticated, requestProcessState)}
            <Icons />
            <Footer />
        </HashRouter>
    );
});

export default App;
