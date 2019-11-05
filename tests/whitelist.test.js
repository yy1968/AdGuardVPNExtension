import Exclusions from '../src/background/exclusions/exclusions';

const proxy = {
    setBypassList: jest.fn(() => {}),
};

const storage = (() => {
    let whitelistList = [];
    return {
        set: jest.fn((key, data) => {
            whitelistList = data;
        }),
        get: jest.fn(() => {
            return whitelistList;
        }),
    };
})();

const exclusions = new Exclusions(proxy, storage);

beforeAll(async (done) => {
    await exclusions.init();
    done();
});

describe('modules bound with exclusions', () => {
    it('should be called once after initialization', async () => {
        expect(proxy.setBypassList).toHaveBeenCalledTimes(1);
        expect(storage.get).toHaveBeenCalledTimes(1);
        expect(storage.set).toHaveBeenCalledTimes(1);
    });

    it('should be called once when adding to index', async () => {
        await exclusions.addToExclusions('http://example.com');
        expect(proxy.setBypassList).toHaveBeenCalledTimes(2);
        expect(storage.set).toHaveBeenCalledTimes(2);
        expect(storage.get).toHaveBeenCalledTimes(1);
    });

    it('should be called once when removing from index', async () => {
        await exclusions.removeFromExclusions('http://example.com');
        expect(proxy.setBypassList).toHaveBeenCalledTimes(3);
        expect(storage.set).toHaveBeenCalledTimes(3);
        expect(storage.get).toHaveBeenCalledTimes(1);
    });
});

describe('exclusions', () => {
    it('should be empty before initialization', () => {
        expect(exclusions.exclusions.length).toEqual(0);
    });

    it('should return false if hostname is NOT exclusions', () => {
        expect(exclusions.isExcluded('http://example.com')).toEqual(false);
    });

    it('should return true if hostname is exclusions', async () => {
        await exclusions.addToExclusions('http://example.com');
        expect(exclusions.isExcluded('http://example.com')).toEqual(true);
    });

    it('should add element correctly', () => {
        expect(exclusions.exclusions.length).toEqual(1);
    });

    it('should return false if hostname is removed from exclusions', async () => {
        await exclusions.removeFromExclusions('http://example.com');
        expect(exclusions.isExcluded('http://example.com')).toEqual(false);
    });

    it('should remove element correctly', () => {
        expect(exclusions.exclusions.length).toEqual(0);
    });
});
