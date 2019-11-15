import {
    lazyGet,
    getUrlProperties,
    getClosestEndpointByCoordinates,
    formatBytes,
} from '../src/lib/helpers';

describe('lazyGet callback', () => {
    const expectedColor = 'blue';
    const cb = jest.fn(() => expectedColor);
    const obj = {
        get color() {
            return lazyGet(obj, 'color', cb);
        },
    };
    it('values should be equal', () => {
        expect(obj.color)
            .toEqual(expectedColor);
    });
    it('should be called when invoked for the first time', () => {
        expect(cb)
            .toHaveBeenCalledTimes(1);
    });
    it('values should be equal', () => {
        expect(obj.color)
            .toEqual(expectedColor);
    });
    it('should NOT be called if invoked for the second time', () => {
        expect(cb)
            .toHaveBeenCalledTimes(1);
    });
    it('should NOT be called if invoked for subsequent times', () => {
        expect(cb)
            .toHaveBeenCalledTimes(1);
    });
});

describe('getUrlProperties', () => {
    it('should return hostname if invoked with URL HTTPS', () => {
        expect(getUrlProperties('https://adguard.com/ru/welcome.html').hostname)
            .toEqual('adguard.com');
    });
    it('should return hostname if invoked with URL HTTP', () => {
        expect(getUrlProperties('http://example.com').hostname)
            .toEqual('example.com');
    });
    it('should return the argument if it is incorrect URL', () => {
        expect(getUrlProperties('chrome://version').hostname)
            .toEqual('version');
    });
});

describe('getClosestEndpointByCoordinates', () => {
    const COORDS = [
        { coordinates: [57, 2] },
        { coordinates: [34, 138] },
        { coordinates: [36, 3] },
        { coordinates: [52, 4] },
        { coordinates: [59, 30] },
    ];
    it('should find the closest coordinates correctly', () => {
        expect(getClosestEndpointByCoordinates({ coordinates: [55, 37] }, COORDS))
            .toEqual({ coordinates: [59, 30] });
    });
});

describe('formatBytes', () => {
    expect(formatBytes(10)).toEqual({ value: '0.0', unit: 'KB' });
    expect(formatBytes(100)).toEqual({ value: '0.1', unit: 'KB' });
    expect(formatBytes(1100)).toEqual({ value: '1.1', unit: 'KB' });
    expect(formatBytes(1110000)).toEqual({ value: '1.1', unit: 'MB' });
    expect(formatBytes(1150000000)).toEqual({ value: '1.1', unit: 'GB' });
    expect(formatBytes(1100000000001)).toEqual({ value: '1.1', unit: 'TB' });
});
