import {
    action,
    computed,
    observable,
    runInAction, toJS,
} from 'mobx';
import JSZip from 'jszip';
import format from 'date-fns/format';
import FileSaver from 'file-saver';

import { ExclusionsData, ExclusionsModes, ExclusionStates, ExclusionsTypes } from '../../common/exclusionsConstants';
import { containsIgnoreCase } from '../components/Exclusions/Search/SearchHighlighter/helpers';
import { Service, ServiceCategory, ServiceInterface } from '../../background/exclusions/services/Service';
import { ExclusionsGroup } from '../../background/exclusions/exclusions/ExclusionsGroup';
import { Exclusion } from '../../background/exclusions/exclusions/Exclusion';
import { ExclusionsDataToImport } from '../../background/exclusions/Exclusions';
// FIXME: convert to named export
import messenger from '../../lib/messenger';
import { ExclusionDtoInterface } from '../../background/exclusions/ExclusionsTree';

export interface PreparedServiceCategory extends ServiceCategory {
    services: string[]
}

interface PreparedServiceCategories {
    [key: string]: PreparedServiceCategory
}

interface PreparedServices {
    [key: string]: ServiceInterface
}

export enum AddExclusionMode {
    SERVICE = 'SERVICE',
    MANUAL = 'MANUAL',
}

const DEFAULT_ADD_EXCLUSION_MODE = AddExclusionMode.MANUAL;

interface ExclusionsInterface {
    excludedIps: Exclusion[];
    exclusionsGroups: ExclusionsGroup[];
    excludedServices: Service[];
}

export class ExclusionsStore {
    @observable exclusions: ExclusionDtoInterface;

    @observable currentMode = ExclusionsModes.Regular;

    @observable servicesData: Service[] = [];

    @observable addExclusionModalOpen = false;

    @observable addSubdomainModalOpen = false;

    @observable removeAllModalOpen = false;

    @observable addExclusionMode = DEFAULT_ADD_EXCLUSION_MODE;

    @observable unfoldedServiceCategories: string[] = [];

    @observable unfoldAllServiceCategories: boolean = false;

    @observable exclusionIdToShowSettings: string | null = null;

    @observable exclusionsSearchValue: string = '';

    @observable servicesSearchValue: string = '';

    /**
     * Temp list used to keep state of services to be enabled or disabled
     */
    @observable servicesToToggle: string[] = [];

    @action setServicesData = (servicesData: Service[]) => {
        this.servicesData = servicesData;
    };

    @action setExclusionsData = (exclusionsData: ExclusionsData) => {
        console.log(exclusionsData);
        this.exclusions = exclusionsData.exclusions;
        this.currentMode = exclusionsData.currentMode;
    };

    @action updateExclusionsData = async () => {
        const exclusionsData = await messenger.getExclusionsData();
        this.setExclusionsData(exclusionsData);
    };

    get preparedExclusions() {
        console.log(toJS(this.exclusions));
        // FIXME filter first level of exclusions
        // const filteredExclusions = allExclusions.filter((exclusion) => {
        //     if (this.exclusionsSearchValue.length === 0) {
        //         return true;
        //     }
        //
        //     return containsIgnoreCase(exclusion.name, this.exclusionsSearchValue);
        // });
        //
        // return filteredExclusions;
        return this.exclusions;
    }

    @action toggleInverted = async (mode: ExclusionsModes) => {
        this.currentMode = mode;
        await messenger.setExclusionsMode(mode);
    };

    @action openAddExclusionModal = () => {
        this.addExclusionModalOpen = true;
    };

    @action closeAddExclusionModal = () => {
        this.addExclusionModalOpen = false;
        this.setServicesSearchValue('');
        this.servicesToToggle = [];
        this.unfoldedServiceCategories = [];
    };

    @action
        setAddExclusionMode = (mode: AddExclusionMode) => {
            this.addExclusionMode = mode;
        };

    @action openAddSubdomainModal = () => {
        this.addSubdomainModalOpen = true;
    };

    @action
        closeAddSubdomainModal = () => {
            this.addSubdomainModalOpen = false;
        };

    @action
        openRemoveAllModal = () => {
            this.removeAllModalOpen = true;
        };

    @action
        closeRemoveAllModal = () => {
            this.removeAllModalOpen = false;
        };

    isExcludedService = (serviceId: string) => {
        return this.exclusions.excludedServices
            .some((service) => service.serviceId === serviceId);
    };

    @computed
    get excludedServices() {
        return this.exclusions.excludedServices;
    }

    @computed
    get preparedServicesData() {
        const categories = this.servicesData.reduce((acc, serviceData) => {
            const { categories, serviceId } = serviceData;

            categories.forEach((category) => {
                const foundCategory = acc[category.id];
                if (!foundCategory) {
                    acc[category.id] = {
                        id: category.id,
                        name: category.name,
                        services: [serviceId],
                    };
                } else {
                    foundCategory.services.push(serviceId);
                }
            });
            return acc;
        }, {} as PreparedServiceCategories);

        // FIXME: prepare data on background page before return
        const servicesWithActualState = this.servicesData.map((serviceData) => {
            // const excluded = this.excludedServices.find((excluded) => {
            //     return excluded.serviceId === serviceData.serviceId;
            // });
            //
            // let state = ExclusionStates.Disabled;
            //
            // if (excluded) {
            //     state = ExclusionStates.Enabled;
            // }

            return {
                ...serviceData,
                state: ExclusionStates.Disabled,
            };
        });

        const services = this.servicesData.reduce((acc, serviceData) => {
            const { serviceId } = serviceData;
            acc[serviceId] = serviceData;
            return acc;
        }, {} as PreparedServices);

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

    @action addUrlToExclusions = async (url: string) => {
        await messenger.addUrlToExclusions(url);
    };

    @action removeExclusion = async (id: string) => {
        await messenger.removeExclusion(id);
    };

    @action toggleExclusionState = async (id: string) => {
        await messenger.toggleExclusionState(id);
    };

    @action addService = async (id: string) => {
        await messenger.addService(id);
    };

    @action addToServicesToToggle = (id: string) => {
        if (this.servicesToToggle.includes(id)) {
            this.servicesToToggle = this.servicesToToggle
                .filter((serviceId) => serviceId !== id);
        } else {
            this.servicesToToggle.push(id);
        }
    };

    /**
     * Removes services from exclusions list if they were added otherwise adds them
     */
    @action toggleServices = async () => {
        await messenger.toggleServices(this.servicesToToggle);
        runInAction(() => {
            this.servicesToToggle = [];
        });
    };

    @action setExclusionIdToShowSettings = (id: string | null) => {
        this.exclusionIdToShowSettings = id;
    };

    @action toggleSubdomainStateInExclusionsGroup = async (
        exclusionsGroupId: string,
        subdomainId: string,
    ) => {
        await messenger.toggleSubdomainStateInExclusionsGroup(exclusionsGroupId, subdomainId);
    };

    @action removeSubdomainFromExclusionsGroup = async (
        exclusionsGroupId: string,
        subdomainId: string,
    ) => {
        this.exclusions.exclusionsGroups.forEach((group) => {
            if (group.id === exclusionsGroupId && group.exclusions[0].id === subdomainId) {
                // show exclusions list if main domain was removed
                this.exclusionIdToShowSettings = null;
            }
        });
        await messenger.removeSubdomainFromExclusionsGroup(exclusionsGroupId, subdomainId);
    };

    @action addSubdomainToExclusionsGroup = async (
        exclusionsGroupId: string,
        subdomain: string,
    ) => {
        await messenger.addSubdomainToExclusionsGroup(exclusionsGroupId, subdomain);
    };

    @action toggleExclusionsGroupStateInService = async (
        serviceId: string,
        exclusionsGroupId: string,
    ) => {
        await messenger.toggleExclusionsGroupStateInService(serviceId, exclusionsGroupId);
    };

    @action removeExclusionsGroupFromService = async (
        serviceId: string,
        exclusionsGroupId: string,
    ) => {
        await messenger.removeExclusionsGroupFromService(serviceId, exclusionsGroupId);
    };

    @action removeSubdomainFromExclusionsGroupInService = async (
        serviceId: string,
        exclusionsGroupId:string,
        subdomainId: string,
    ) => {
        const excludedService = this.exclusions.excludedServices
            .find((service) => service.serviceId === serviceId);
        if (!excludedService) {
            throw new Error('Service should be found');
        }

        const exclusionsGroupToRemove = excludedService.exclusionsGroups
            .find((group) => group.id === exclusionsGroupId);
        if (!exclusionsGroupToRemove) {
            throw new Error('Group should be found');
        }

        if (exclusionsGroupToRemove.exclusions[0].id === subdomainId) {
            // show service screen if main domain was removed
            this.exclusionIdToShowSettings = serviceId;
        }

        await messenger.removeSubdomainFromExclusionsGroupInService(
            serviceId,
            exclusionsGroupId,
            subdomainId,
        );
    };

    @action toggleSubdomainStateInExclusionsGroupInService = async (
        serviceId: string,
        exclusionsGroupId:string,
        subdomainId: string,
    ) => {
        await messenger.toggleSubdomainStateInExclusionsGroupInService(
            serviceId,
            exclusionsGroupId,
            subdomainId,
        );
    };

    @action addSubdomainToExclusionsGroupInService = async (
        serviceId: string,
        exclusionsGroupId:string,
        subdomain: string,
    ) => {
        await messenger.addSubdomainToExclusionsGroupInService(
            serviceId,
            exclusionsGroupId,
            subdomain,
        );
    };

    @computed
    get exclusionDataToShow() {
        if (!this.exclusionIdToShowSettings) {
            return null;
        }

        const serviceData = this.exclusions.excludedServices
            .find(({ serviceId }) => serviceId === this.exclusionIdToShowSettings);

        const servicesGroupData = this.exclusions.excludedServices
            .map(({ exclusionsGroups }) => exclusionsGroups)
            .flat()
            .find(({ id }) => id === this.exclusionIdToShowSettings);

        const groupData = this.exclusions.exclusionsGroups
            .find(({ id }) => id === this.exclusionIdToShowSettings);

        return serviceData || servicesGroupData || groupData || null;
    }

    /**
     * Checks if ExclusionsGroup is inside Service and returns Service id or null
     * @param exclusionsGroupId
     */
    @action isExclusionsGroupInsideService = (exclusionsGroupId: string) => {
        const service = this.exclusions.excludedServices
            .find((service) => service.exclusionsGroups
                .find(({ id }) => id === exclusionsGroupId));
        return service ? service.serviceId : null;
    };

    @action setExclusionsSearchValue = (value: string) => {
        this.exclusionsSearchValue = value;
    };

    @action setUnfoldAllServiceCategories = (unfold: boolean) => {
        this.unfoldAllServiceCategories = unfold;
    };

    @action setServicesSearchValue = (value: string) => {
        this.servicesSearchValue = value;

        this.setUnfoldAllServiceCategories(this.servicesSearchValue.length > 0);
    };

    @action resetServiceData = async (serviceId: string) => {
        await messenger.resetServiceData(serviceId);
    };

    @action clearExclusionsList = async () => {
        await messenger.clearExclusionsList();
    };

    exportExclusions = async () => {
        const nowFormatted = format(Date.now(), 'yyyy_MM_dd-HH_mm_ss');
        const ZIP_FILENAME = `exclusions-${nowFormatted}.zip`;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const EXCLUSION_FILES_EXTENSIONS = {
            REGULAR: '.regular.txt',
            SELECTIVE: '.selective.txt',
        };

        const zip = new JSZip();
        // FIXME get exclusions from store, check format
        // eslint-disable-next-line max-len
        // zip.file(`${nowFormatted}${EXCLUSION_FILES_EXTENSIONS.REGULAR}`, JSON.stringify(this.exclusions[ExclusionsModes.Regular], null, 4));
        // eslint-disable-next-line max-len
        // zip.file(`${nowFormatted}${EXCLUSION_FILES_EXTENSIONS.SELECTIVE}`, JSON.stringify(this.exclusions[ExclusionsModes.Selective], null, 4));

        const zipContent = await zip.generateAsync({ type: 'blob' });
        FileSaver.saveAs(zipContent, ZIP_FILENAME);
    };

    @action importExclusions = async (exclusionsData: ExclusionsDataToImport[]) => {
        await messenger.importExclusionsData(exclusionsData);
    };
}
