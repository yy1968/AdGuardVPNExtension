import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import { ExclusionsModal } from '../ExclusionsModal';
import { rootStore } from '../../../../stores';
import { AddExclusionMode } from '../../../../stores/ExclusionsStore';
import { ServiceMode } from './ServiceMode/ServiceMode';
import { ManualMode } from './ManualMode/ManualMode';

import '../exclusions-modal.pcss';

export const AddExclusionModal = observer(() => {
    const { exclusionsStore } = useContext(rootStore);

    const isOpen = exclusionsStore.addExclusionModalOpen;

    const onClose = () => {
        exclusionsStore.closeAddExclusionModal();
    };

    const onServiceModeClick = () => {
        exclusionsStore.setAddExclusionMode(AddExclusionMode.SERVICE);
    };

    const onManualModeClick = () => {
        exclusionsStore.setAddExclusionMode(AddExclusionMode.MANUAL);
    };

    const ModeSelectButtons = {
        service: {
            classname: classnames(
                'mode-select-button',
                { enabled: exclusionsStore.addExclusionMode === AddExclusionMode.SERVICE },
            ),
        },
        manual: {
            classname: classnames(
                'mode-select-button',
                { enabled: exclusionsStore.addExclusionMode === AddExclusionMode.MANUAL },
            ),
        },
    };

    // FIXME add screens to handle cases:
    //  1. when exclusions were not received from the backend
    //  2. or when exclusions were not found?
    const MODE_MAP = {
        [AddExclusionMode.SERVICE]: () => <ServiceMode />,
        [AddExclusionMode.MANUAL]: () => <ManualMode />,
    };

    const mode = MODE_MAP[exclusionsStore.addExclusionMode];

    return (
        <ExclusionsModal
            isOpen={isOpen}
            closeModal={onClose}
            // FIXME add to translations
            title="Add a website"
        >
            <div className="modal__mode-selectors">
                <button
                    onClick={onServiceModeClick}
                    type="button"
                    className={ModeSelectButtons.service.classname}
                >
                    {/* FIXME add to translations */}
                    From the list
                </button>
                <button
                    onClick={onManualModeClick}
                    type="button"
                    className={ModeSelectButtons.manual.classname}
                >
                    {/* FIXME add to translations */}
                    Manually
                </button>
            </div>
            <div className="mode">
                {mode()}
            </div>
        </ExclusionsModal>
    );
});
