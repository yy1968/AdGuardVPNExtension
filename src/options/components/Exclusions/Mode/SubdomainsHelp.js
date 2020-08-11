import React from 'react';

import Popover from '../../ui/Popover';
import { reactTranslator } from '../../../../reactCommon/reactTranslator';

const SubdomainsHelp = () => (
    <Popover>
        <>
            <div className="popover__title">
                {reactTranslator.translate('settings_exclusion_subdomains_title')}
            </div>
            <div className="popover__text-wr">
                <p className="popover__text">{reactTranslator.translate('settings_exclusion_subdomains_text_1')}</p>
                <p className="popover__text">{reactTranslator.translate('settings_exclusion_subdomains_text_2')}</p>
            </div>
        </>
    </Popover>
);

export default SubdomainsHelp;
