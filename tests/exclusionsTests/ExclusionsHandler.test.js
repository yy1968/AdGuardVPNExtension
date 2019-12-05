// TODO [maximtop] fix tests
// import ExclusionsHandler from '../src/background/exclusions/ExclusionsHandler';
// import { sleep } from '../src/lib/helpers';
//
// const proxy = {
//     setBypassList: jest.fn(() => {
//     }),
// };
//
// const settings = (() => {
//     let settingsStorage = {};
//     return {
//         setExclusions: jest.fn((data) => {
//             settingsStorage = data;
//         }),
//         getExclusions: jest.fn(() => {
//             return settingsStorage;
//         }),
//     };
// })();
//
// const browser = {
//     runtime: {
//         sendMessage: () => {
//         },
//     },
// };
//
// const exclusions = new ExclusionsHandler(browser, proxy, settings);
//
// beforeAll(async (done) => {
//     await exclusions.init();
//     done();
// });
//
// describe('exclusions', () => {
//     afterEach(async (done) => {
//         await exclusions.clearExclusions();
//         done();
//     });
//
//     it('should be empty after initialization', () => {
//         const exclusionsList = exclusions.getExclusions();
//         expect(exclusionsList.length).toEqual(0);
//     });
//
//     it('should return false if hostname is NOT in exclusions', () => {
//         expect(exclusions.isExcluded('http://example.org')).toEqual(false);
//     });
//
//     it('should return true if hostname is IN exclusions', async () => {
//         await exclusions.addToExclusions('http://example.org');
//         const exclusionsList = exclusions.getExclusions();
//         expect(exclusionsList.length).toEqual(1);
//         expect(exclusions.isExcluded('http://example.org')).toEqual(true);
//     });
//
//     it('should turn on if added exclusion is already in exclusions list', async () => {
//         await exclusions.addToExclusions('http://example.org');
//         let exclusionsList = exclusions.getExclusions();
//         expect(exclusionsList.length).toEqual(1);
//         expect(exclusions.isExcluded('http://example.org')).toEqual(true);
//
//         await exclusions.toggleExclusion(exclusionsList[0].id);
//         exclusionsList = exclusions.getExclusions();
//         expect(exclusionsList.length).toEqual(1);
//         expect(exclusions.isExcluded('http://example.org')).toEqual(false);
//
//         await exclusions.addToExclusions('http://example.org');
//         exclusionsList = exclusions.getExclusions();
//         expect(exclusionsList.length).toEqual(1);
//         expect(exclusions.isExcluded('http://example.org')).toEqual(true);
//     });
//
//     it('should return false if hostname is IN exclusions and is not enabled', () => {
//         let exclusionsList = exclusions.getExclusions();
//         expect(exclusionsList.length).toEqual(0);
//         const url1 = 'http://example.org';
//         exclusions.addToExclusions(url1);
//         exclusionsList = exclusions.getExclusions();
//         expect(exclusionsList.length).toEqual(1);
//         const exclusion = exclusionsList[0];
//         expect(exclusions.isExcluded('http://example.org')).toEqual(true);
//         exclusions.toggleExclusion(exclusion.id);
//         exclusionsList = exclusions.getExclusions();
//         expect(exclusionsList.length).toEqual(1);
//         expect(exclusionsList[0].enabled).toBeFalsy();
//         expect(exclusionsList[0].hostname).toEqual('example.org');
//         expect(exclusions.isExcluded('http://example.org')).toEqual(false);
//     });
//
//     it('should toggle correctly', () => {
//         exclusions.addToExclusions('http://example.org');
//         const exclusionsList = exclusions.getExclusions();
//         expect(exclusionsList.length).toEqual(1);
//         expect(exclusions.isExcluded('http://example.org')).toBeTruthy();
//         exclusions.toggleExclusion(exclusionsList[0].id);
//         expect(exclusions.isExcluded('http://example.org')).toBeFalsy();
//         exclusions.toggleExclusion(exclusionsList[0].id);
//         expect(exclusions.isExcluded('http://example.org')).toBeTruthy();
//     });
//
//     it('should add more than one correctly', async () => {
//         await exclusions.addToExclusions('http://example.org');
//         await exclusions.addToExclusions('http://example1.org');
//         let exclusionsList = exclusions.getExclusions();
//         expect(exclusionsList.length).toEqual(2);
//         const removedExclusion = exclusionsList[0];
//         await exclusions.removeFromExclusions(removedExclusion.id);
//         exclusionsList = exclusions.getExclusions();
//         expect(exclusionsList.length).toEqual(1);
//     });
//
//     it('can rename exclusions', async () => {
//         await exclusions.addToExclusions('http://example.org');
//         let exclusionsList = exclusions.getExclusions();
//         let exclusion = exclusionsList[0];
//         await exclusions.renameExclusion(exclusion.id, 'http://new-example.org');
//         exclusionsList = exclusions.getExclusions();
//         // eslint-disable-next-line prefer-destructuring
//         exclusion = exclusionsList[0];
//         expect(exclusion.hostname).toEqual('new-example.org');
//     });
// });
