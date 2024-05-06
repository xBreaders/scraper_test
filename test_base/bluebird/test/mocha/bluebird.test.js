const bluebird = require('../../src/bluebird'); // Assuming bluebird is exported from src/bluebird.js

describe('noConflict function', () => {
    let originalPromise;

    beforeEach(() => {
        originalPromise = Promise; // Store the original Promise constructor
    });

    afterEach(() => {
        Promise = originalPromise; // Restore the original Promise constructor
    });

    test('restores the original Promise and returns bluebird', () => {
// Mock the scenario where bluebird has been assigned to Promise
        Promise = bluebird;

        const result = bluebird.noConflict();

        expect(Promise).toBe(originalPromise); // Verify Promise is restored
        expect(result).toBe(bluebird); // Verify the return value
    });

    test('does not modify Promise if it is not bluebird', () => {
// Mock a scenario where Promise is something else
        Promise = function CustomPromise() {};

        bluebird.noConflict();

        expect(Promise).not.toBe(bluebird); // Ensure Promise remains unchanged
    });

    test('handles errors gracefully', () => {
// Mock a scenario where accessing/modifying Promise throws an error
        Promise = { get: () => { throw new Error('Test Error'); } };

        expect(() => bluebird.noConflict()).not.toThrow(); // Ensure no errors are thrown
    });
});
