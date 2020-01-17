import React, { Fragment, useContext } from 'react';
import { observer } from 'mobx-react';
import translator from '../../../../lib/translator';
import rootStore from '../../../stores';

const Webrtc = observer(() => {
    const { settingsStore } = useContext(rootStore);

    const handleCheckboxChange = async (e) => {
        await settingsStore.setWebRTC(e.currentTarget.checked);
    };

    return (
        <Fragment>
            <div className="settings__section">
                <div className="settings__title">
                    {translator.translate('settings_webrtc_title')}
                </div>
                <div className="settings__group">
                    <div className="settings__controls">
                        <div>
                            <span>Block WebRTC</span>
                            <input type="checkbox" name="webrtc" onChange={handleCheckboxChange} checked={settingsStore.webRTCEnabled} />
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
});

export default Webrtc;
