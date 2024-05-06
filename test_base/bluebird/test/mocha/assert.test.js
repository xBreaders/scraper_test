const  assert  = require("../../src/assert");

describe('assert function', () => {
    test('throws AssertionError if the expression is false', () => {
        expect(() => assert(false, "test error")).toThrow(assert.AssertionError);
    });

    test('does not throw if the expression is true', () => {
        expect(() => assert(true, "test error")).not.toThrow();
    });

    test('throws correct message with AssertionError', () => {
        try {
            assert(false, "test error");
        } catch (error) {
            expect(error.message).toBe("test error");
            expect(error.name).toBe("AssertionError");
        }
    });
});

describe('nativeAssert function', () => {
    test('evaluates expression correctly without errors', () => {
        const result = assert("%Math.max", [1, 2], 2);
        expect(result).toBe(2); // Assuming nativeAssert is exposed for testing
    });

    test('returns the expect value on SyntaxError', () => {
        const result = assert("%invalidFunc", [1, 2], "fallback result");
        expect(result).toBe("fallback result");
    });
});
