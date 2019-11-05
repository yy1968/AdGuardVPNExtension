import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import browser from 'webextension-polyfill';

import log from '../../../lib/logger';
import { MESSAGES_TYPES } from '../../../lib/constants';

import '../../styles/main.pcss';
import './app.pcss';

import rootStore from '../../stores';
import Sidebar from '../Sidebar';
import Footer from '../Footer';
import Settings from '../Settings';
import Account from '../Account';
import About from '../About';

const App = observer(() => {
    const {
        authStore,
        settingsStore,
    } = useContext(rootStore);

    useEffect(() => {
        (async () => {
            authStore.isAuthenticated();
            settingsStore.getExclusions();
        })();

        const messageHandler = async (message) => {
            const { type } = message;

            switch (type) {
                case MESSAGES_TYPES.EXCLUSION_ADDED:
                case MESSAGES_TYPES.EXCLUSION_REMOVED: {
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

    const { authenticated } = authStore;

    if (!authenticated) {
        return (
            <div className="container">
                TODO
            </div>
        );
    }

    return (
        <HashRouter hashType="noslash">
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
            <Footer />
        </HashRouter>
    );
});

export default App;
