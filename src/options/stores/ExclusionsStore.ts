import {
    action,
    observable,
    computed,
} from 'mobx';

import { EXCLUSIONS_MODES } from '../../common/exclusionsConstants';
import messenger from '../../lib/messenger';

export enum AddExclusionMode {
    SERVICE = 'SERVICE',
    MANUAL = 'MANUAL',
}

const DEFAULT_ADD_EXCLUSION_MODE = AddExclusionMode.SERVICE;

export class ExclusionsStore {
    @observable exclusions = {
        [EXCLUSIONS_MODES.SELECTIVE]: {
            excludedIps: [],
            exclusionsGroups: [],
            excludedServices: [],
        },
        [EXCLUSIONS_MODES.REGULAR]: {
            excludedIps: [],
            exclusionsGroups: [],
            excludedServices: [],
        },
    };

    // FIXME remove ts-ignore
    // @ts-ignore
    @observable currentMode;

    // FIXME remove ts-ignore
    // @ts-ignore
    @observable servicesData;

    @observable addExclusionModalOpen = false;

    @observable addExclusionMode = DEFAULT_ADD_EXCLUSION_MODE;

    @observable unfoldedServiceCategories: string[] = [];

    // FIXME remove any
    @action
    setServicesData = (servicesData: any) => {
        // console.log(servicesData);
        this.servicesData = servicesData;
    }

    // FIXME remove any
    @action
    setExclusionsData = (exclusionsData: any) => {
        // console.log(exclusionsData);
        this.exclusions = exclusionsData;
        this.currentMode = exclusionsData.currentMode;
    }

    // FIXME remove any
    @action
    getExcludedServicesList = (mode: any) => {
        // FIXME remove ts-ignore
        // @ts-ignore
        return this.exclusions[mode].excludedServices.map((service) => service.serviceName);
    }

    // FIXME remove any
    @action
    getExclusionsGroupsList = (mode: any) => {
        // FIXME remove ts-ignore
        // @ts-ignore
        return this.exclusions[mode].exclusionsGroups.map((group) => group.hostname);
    }

    // FIXME remove any
    @action
    getExcludedIpsList = (mode: any) => {
        // FIXME remove ts-ignore
        // @ts-ignore
        return this.exclusions[mode].excludedIps.map((ip) => ip.hostname);
    }

    // FIXME remove ts-ignore
    @computed
    get preparedExclusions() {
        // FIXME what sorting should be?
        // @ts-ignore
        const currentModeExclusions = this.exclusions[this.currentMode];
        const services = currentModeExclusions.excludedServices
        // @ts-ignore
            .map((service) => service.serviceName);
        // @ts-ignore
        const groups = currentModeExclusions.exclusionsGroups.map((group) => group.hostname);
        // @ts-ignore
        const excludedIps = currentModeExclusions.excludedIps.map((ip) => ip.hostname);

        return [...services, ...groups, ...excludedIps];
    }

    // FIXME remove any
    @action
    toggleInverted = async (mode: any) => {
        this.currentMode = mode;
        await messenger.setExclusionsMode(mode);
    };

    @action
    openAddExclusionModal = () => {
        this.addExclusionModalOpen = true;
    };

    @action
    closeAddExclusionModal = () => {
        this.addExclusionModalOpen = false;
    };

    @action
    setAddExclusionMode = (mode: AddExclusionMode) => {
        this.addExclusionMode = mode;
    }

    @computed
    get preparedServicesData() {
        // FIXME remove ts-ignore
        // @ts-ignore
        const categories = this.servicesData.reduce((acc, serviceData) => {
            const { categories, serviceId } = serviceData;
            // FIXME remove ts-ignore
            // @ts-ignore
            categories.forEach((category) => {
                const foundCategory = acc[category];
                if (!foundCategory) {
                    acc[category] = { id: category, title: category, services: [serviceId] };
                } else {
                    foundCategory.services.push(serviceId);
                }
            });
            return acc;
        }, {});

        // FIXME remove ts-ignore
        // @ts-ignore
        const services = this.servicesData.reduce((acc, serviceData) => {
            const { serviceId } = serviceData;
            acc[serviceId] = serviceData;
            return acc;
        }, {});

        return {
            categories,
            services,
        };
    }

    @action
    toggleCategoryVisibility(id: string) {
        const isUnfolded = this.unfoldedServiceCategories
            .some((categoryId) => categoryId === id);

        if (isUnfolded) {
            this.unfoldedServiceCategories = this.unfoldedServiceCategories
                .filter((categoryId) => categoryId !== id);
        } else {
            this.unfoldedServiceCategories.push(id);
        }
    }
}