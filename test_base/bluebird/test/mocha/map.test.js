const Promise = require('bluebird'); // Assuming Promise is exported from bluebird

describe('map function', () => {
    it('should map values correctly with a synchronous function', () => {
        const input = [1, 2, 3];
        const fn = (x) => x * 2;
        return expect(Promise.map(input, fn)).resolves.toEqual([2, 4, 6]);
    });

    it('should map values correctly with an asynchronous function', () => {
        const input = [1, 2, 3];
        const fn = async (x) => x * 2;
        return expect(Promise.map(input, fn)).resolves.toEqual([2, 4, 6]);
    });

    it('should handle errors thrown in the mapping function', () => {
        const input = [1, 2, 3];
        const fn = (x) => {
            if (x === 2) {
                throw new Error('Test error');
            }
            return x * 2;
        };
        return expect(Promise.map(input, fn)).rejects.toThrow('Test error');
    });

    it('should respect the concurrency option', async () => {
        const input = [1, 2, 3, 4, 5];
        const fn = (x) => Promise.delay(100).then(() => x * 2);
        const startTime = Date.now();
        await Promise.map(input, fn, { concurrency: 2 });
        const endTime = Date.now();
// With concurrency 2, processing should take at least 200ms (two batches of 100ms each)
        expect(endTime - startTime).toBeGreaterThanOrEqual(200);
    });

});
