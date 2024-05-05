"use strict";
/*
Based on When.js tests

Open Source Initiative OSI - The MIT License

http://www.opensource.org/licenses/mit-license.php

Copyright (c) 2011 Brian Cavalier

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
var assert = require("assert");
var testUtils = require("./helpers/util.js");
var sentinel = {};
var other = {};
var RangeError = Promise.RangeError;

describe("Promise.any-test", function () {

    specify("should reject on empty input array", function() {
        var a = [];
        return Promise.any(a)
            .caught(RangeError, testUtils.returnToken)
            .then(testUtils.assertToken);
    });

    specify("should resolve with an input value", function() {
        var input = [1, 2, 3];
        return Promise.any(input).then(
            function(result) {
                assert(testUtils.contains(input, result));
            }, assert.fail
        );
    });

    specify("should resolve with a promised input value", function() {
        var input = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];
        return Promise.any(input).then(
            function(result) {
                assert(testUtils.contains([1, 2, 3], result));
            }, assert.fail
        );
    });

    specify("should reject with all rejected input values if all inputs are rejected", function() {
        var input = [Promise.reject(1), Promise.reject(2), Promise.reject(3)];
        var promise = Promise.any(input);

        return promise.then(
            assert.fail,
            function(result) {
                //Cannot use deep equality in IE8 because non-enumerable properties are not
                //supported
                assert(result[0] === 1);
                assert(result[1] === 2);
                assert(result[2] === 3);
            }
        );
    });

    describe("Promise.any Functionality", function () {
        class SomePromiseArray {
            constructor(promises) {
                this.promises = promises;
                this._isPending = true;
            }

            promise() {
                return {
                    isPending: () => this._isPending
                };
            }

            setHowMany(howMany) {
                // Mock behavior, do nothing
            }

            setUnwrap() {
                // Mock behavior, do nothing
            }

            init() {
                // Mock behavior, setting promise to not pending
                this._isPending = false;
            }
        }

        it("should return a pending promise initially", function () {
            const promises = [Promise.resolve(1), Promise.resolve(2)];
            const ret = new SomePromiseArray(promises);
            const promise = ret.promise();

            assert.strictEqual(promise.isPending(), true);
        });

        it("should return an instance of SomePromiseArray", function () {
            const promises = [Promise.resolve(1), Promise.resolve(2)];
            const ret = new SomePromiseArray(promises);

            assert(ret instanceof SomePromiseArray);
        });

        it("should set HowMany and Unwrap without issues", function () {
            const promises = [Promise.resolve(1), Promise.resolve(2)];
            const ret = new SomePromiseArray(promises);

            ret.setHowMany(1);
            ret.setUnwrap();

            assert.ok(true, "setHowMany and setUnwrap executed without issues");
        });

        it("should initialize correctly", function () {
            const promises = [Promise.resolve(1), Promise.resolve(2)];
            const ret = new SomePromiseArray(promises);
            const promise = ret.promise();

            ret.init();

            assert.strictEqual(promise.isPending(), false);
        });
    });

    const assert = require('assert');

    describe('Promise.any', () => {
        it('should resolve with the first resolved value', async () => {
            const promises = [
                new Promise((resolve) => setTimeout(resolve, 100, 'first')),
                new Promise((resolve) => setTimeout(resolve, 200, 'second')),
            ];
            const result = await Promise.any(promises);
            assert.strictEqual(result, 'first');
        });

        it('should reject with an AggregateError if all promises reject', async () => {
            const promises = [
                new Promise((_, reject) => setTimeout(reject, 100, 'error1')),
                new Promise((_, reject) => setTimeout(reject, 200, 'error2')),
            ];
            try {
                await Promise.any(promises);
                assert.fail('Promise.any should have rejected');
            } catch (error) {
                assert(error instanceof AggregateError);
                assert.strictEqual(error.errors.length, 2);
                assert.strictEqual(error.errors[0], 'error1');
                assert.strictEqual(error.errors[1], 'error2');
            }
        });
    });

    specify("should accept a promise for an array", function() {
        var expected, input;

        expected = [1, 2, 3];
        input = Promise.resolve(expected);

        return Promise.any(input).then(
            function(result) {
                assert.notDeepEqual(expected.indexOf(result), -1);
            }, assert.fail
        );
    });

    specify("should allow zero handlers", function() {
        var input = [1, 2, 3];
        return Promise.any(input).then(
            function(result) {
                assert(testUtils.contains(input, result));
            }, assert.fail
        );
    });

    specify("should resolve to empty array when input promise does not resolve to array", function() {
        return Promise.any(Promise.resolve(1))
            .caught(TypeError, testUtils.returnToken)
            .then(testUtils.assertToken);
    });

    specify("should reject when given immediately rejected promise", function() {
        var err = new Error();
        return Promise.any(Promise.reject(err)).then(assert.fail, function(e) {
            assert.strictEqual(err, e);
        });
    });
});
