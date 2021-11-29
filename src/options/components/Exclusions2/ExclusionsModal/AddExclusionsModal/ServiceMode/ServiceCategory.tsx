import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import cn from 'classnames';

import { rootStore } from '../../../../../stores';
import { ServiceRow } from './ServiceRow';

import { containsIgnoreCase } from '../../../Search/SearchHighlighter/helpers';
import { PreparedServiceCategory } from '../../../../../stores/ExclusionsStore';

// FIXME fix linter
// @ts-ignore
import s from './service-category.module.pcss';

export interface ServiceCategoryProps {
    category: PreparedServiceCategory;
}

export const ServiceCategory = observer(({ category }: ServiceCategoryProps) => {
    console.log(category);

    const { exclusionsStore } = useContext(rootStore);
    const { services } = exclusionsStore.preparedServicesData;

    // @ts-ignore
    const categoryServices = category.services
        // FIXME: remove ts-ignore
        // @ts-ignore
        .map((serviceId: string) => services[serviceId])
        .filter((serviceData) => !(exclusionsStore.excludedServices
            // FIXME: remove ts-ignore
            // @ts-ignore
            .some((service) => serviceData.serviceId === service.serviceId)));

    // FIXME remove @ts-ignore
    // @ts-ignore
    const filteredServices = categoryServices.filter((service) => {
        if (exclusionsStore.servicesSearchValue.length === 0) {
            return true;
        }

        return containsIgnoreCase(service.serviceName, exclusionsStore.servicesSearchValue);
    });

    const handleClickOnCategory = () => {
        exclusionsStore.toggleCategoryVisibility(category.id);
    };

    const unfoldCategory = exclusionsStore.unfoldAllServiceCategories
        || exclusionsStore.unfoldedServiceCategories.some((id) => id === category.id);

    const categoryClassname = cn('category', {
        category__unfolded: unfoldCategory,
        category__folded: !unfoldCategory,
    });

    const categoryServicesClassname = cn('category__services', {
        [s.show]: unfoldCategory,
        [s.hide]: !unfoldCategory,
    });

    if (filteredServices.length === 0) {
        return null;
    }

    return (
        <div className={categoryClassname}>
            <div className="category__title" onClick={handleClickOnCategory}>
                {category.name}
            </div>
            <div className={categoryServicesClassname}>
                {
                    // FIXME remove ts-ignore
                    // @ts-ignore
                    filteredServices.map((service) => {
                        return (<ServiceRow key={service.serviceId} service={service} />);
                    })
                }
            </div>
        </div>
    );
});
