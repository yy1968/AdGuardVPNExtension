import React, { useContext, useRef, useEffect } from 'react';
import { observer } from 'mobx-react';
import cn from 'classnames';

import { ExclusionsTypes, ExclusionDtoInterface, ICON_FOR_DOMAIN } from '../../../../../common/exclusionsConstants';
import { StateCheckbox } from '../../StateCheckbox';
import { rootStore } from '../../../../stores';
import { SearchHighlighter } from '../../Search/SearchHighlighter';

import './list-item.pcss';

interface ListItemProps {
    exclusion: ExclusionDtoInterface;
}

export const ListItem = observer(({ exclusion }: ListItemProps) => {
    const { exclusionsStore } = useContext(rootStore);

    const icon = useRef(null);

    const removeExclusion = (exclusion: ExclusionDtoInterface) => async () => {
        await exclusionsStore.removeExclusion(exclusion);
    };

    const toggleState = (id: string) => () => {
        exclusionsStore.toggleExclusionState(id);
    };

    const followToChildren = (exclusion: ExclusionDtoInterface) => () => {
        if (exclusion.children.length === 0) {
            return;
        }
        exclusionsStore.setSelectedExclusionId(exclusion.id);
    };

    const listIndexTitleClasses = (hasChildren: boolean) => cn('list-item__title', {
        'ip-title': !hasChildren,
    });

    useEffect(() => {
        if (exclusion.type === ExclusionsTypes.Service && exclusion.iconUrl) {
            // @ts-ignore
            icon.current.src = exclusion.iconUrl;
        }

        if (exclusion.type === ExclusionsTypes.Group) {
            const preloadedIcon = new Image();
            preloadedIcon.src = `${ICON_FOR_DOMAIN}${exclusion.value}`;
            preloadedIcon.onload = () => {
                // @ts-ignore
                icon.current.src = preloadedIcon.src;
            };
        }
    });

    return (
        <li
            key={exclusion.id}
            className="list-item"
        >
            <StateCheckbox
                id={exclusion.id}
                state={exclusion.state}
                toggleHandler={toggleState}
            />
            <div
                className={listIndexTitleClasses(exclusion.children.length > 0)}
                onClick={followToChildren(exclusion)}
            >
                <img
                    src="./assets/images/ip-icon.svg"
                    ref={icon}
                    className="list-item__title__icon"
                    alt="exclusion icon"
                />
                <SearchHighlighter
                    value={exclusion.value}
                    search={exclusionsStore.exclusionsSearchValue}
                />
            </div>
            <svg className="icon list-item__arrow">
                <use xlinkHref="#arrow" />
            </svg>
            <button
                type="button"
                className="list-item__remove-button"
                onClick={removeExclusion(exclusion)}
            >
                <svg className="list-item__remove-button__icon">
                    <use xlinkHref="#basket" />
                </svg>
            </button>
        </li>
    );
});
