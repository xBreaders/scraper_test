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



const SomePromiseArray = Promise._SomePromiseArray;
const any = Promise.any


describe('any', () => {
    it('should return a pending promise', () => {
        const promises = [Promise.resolve(1), Promise.resolve(2)];
        const promise = Promise.any(promises);
        assert(promise.isPending());
    });

    it('should return a SomePromiseArray instance', () => {
        const promises = [Promise.resolve(1), Promise.resolve(2)];
        const ret = Promise.any(promises);
        assert(ret instanceof SomePromiseArray);
    });

    // More comprehensive tests would involve checking fulfillment values and rejection reasons
    // under different scenarios, such as when some promises fulfill and others reject.
    // However, these would require mocking or complex setups to control promise behavior,
    // which is beyond the scope of simple unit tests without external dependencies.
});


