const Promise = require('../../src/promise'); // Assuming Promise is exported from the file


describe('check function', () => {
    test('throws TypeError if self is not a Promise', () => {
        expect(() => Promise.check({}, () => {})).toThrow(Promise.TypeError);
        expect(() => Promise.check(null, () => {})).toThrow(Promise.TypeError);
        expect(() => check(undefined, () => {})).toThrow(Promise.TypeError);
    });

    test('throws TypeError if executor is not a function', () => {
        expect(() => Promise.check(Promise.resolve, {})).toThrow(Promise.TypeError);
        expect(() => Promise.check(Promise.resolve, null)).toThrow(Promise.TypeError);
        expect(() => Promise.check(Promise.resolve, undefined)).toThrow(Promise.TypeError);
    });

    test('does not throw if self is a Promise and executor is a function', () => {
        expect(() => Promise.check(Promise.resolve(), () => {})).not.toThrow();
    });
});
