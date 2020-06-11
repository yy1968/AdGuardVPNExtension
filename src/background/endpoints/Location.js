import { Endpoint } from './Endpoint';

export class Location {
    constructor(locationData) {
        this.id = locationData.id;
        this.countryName = locationData.countryName;
        this.cityName = locationData.cityName;
        this.countryCode = locationData.countryCode;
        this.endpoints = locationData.endpoints.map((endpoint) => new Endpoint(endpoint));
        this.coordinates = locationData.coordinates;
        this.available = true;
        this.ping = null;
    }

    setAvailable = (state) => {
        this.available = state;
    }

    setPing = (ping) => {
        this.ping = ping;
    }

    getEndpointById(id) {
        return this.endpoints.find((endpoint) => endpoint.id === id);
    }
}
