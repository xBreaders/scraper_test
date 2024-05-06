const Async = require('../../src/async'); // Assuming Async is exported from src/async.js
const Queue = require('../../src/queue');
// Assuming Queue is exported from src/queue.js

describe('Async', () => {
    let async;

    beforeEach(() => {
        async = new Async();
        async._isTickUsed = false;
    });

    describe('constructor', () => {
        it('should initialize properties correctly', () => {
            expect(async._customScheduler).toBe(false);
            expect(async._isTickUsed).toBe(false);
            expect(async._lateQueue).toBeInstanceOf(Queue);
            expect(async._normalQueue).toBeInstanceOf(Queue);
            expect(async._haveDrainedQueues).toBe(false);
            expect(async.drainQueues).toBeInstanceOf(Function);
        });
    });

    describe('drainQueues', () => {
        it('should call _drainQueues', () => {
            const spy = jest.spyOn(async, '_drainQueues');
            async.drainQueues();
            expect(spy).toHaveBeenCalled();

        });
    });
});
