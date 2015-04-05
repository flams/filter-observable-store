/*global describe, it, beforeEach */
/**
 * filter-observable-store - https://github.com/flams/filter-observable-store
 * Copyright(c) 2015 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */
"use strict";

var chai = require("chai");
var expect = chai.expect;
var sinon = require("sinon");

var Store = require("observable-store");


describe("GIVEN filter", function () {
    var Filter = require("../index");

    describe("WHEN initialized with an invalid observable store", function () {
        var filter;

        it("THEN throws a new TypeError", function () {
            expect(function () {
                filter = new Filter({});
            }).to.throw("Filter needs to be initialized with a valid observable store");
        });
    });

    describe("WHEN initialized with a valid observable store", function () {
        var filter, store;

        beforeEach(function () {
            store = new Store([0, 1, 2, 3, 4]);

            filter = new Filter(store);
        });

        describe("WHEN getting the count", function () {
            var count;
            beforeEach(function () {
                count = filter.count();
            });

            it("THEN returns the unfiltered count", function () {
                expect(count).to.equal(5);
            });
        });

        describe("WHEN looping over the store", function () {
            var spy;
            beforeEach(function () {
                spy = sinon.spy();

                filter.loop(spy);
            });

            it("THEN calls the callback with all the values", function () {
                expect(spy.calledWith(0, 0)).to.equal(true);
                expect(spy.calledWith(1, 1)).to.equal(true);
                expect(spy.calledWith(2, 2)).to.equal(true);
                expect(spy.calledWith(3, 3)).to.equal(true);
                expect(spy.calledWith(4, 4)).to.equal(true);
            });
        });

        describe("WHEN observing a specific value", function () {
            var spy;
            beforeEach(function () {
                spy = sinon.spy();
                filter.watchValue(3, spy);
                filter.set(3, 5);
            });

            it("THEN triggers an event", function () {
                expect(spy.calledWith(5)).to.equal(true);
            });
        });

        describe("WHEN setting a filter to get the even values", function () {
            var spy, scope = {};

            beforeEach(function () {
                spy = sinon.spy();

                filter.watch("filter", spy);
                filter.setFilter(function (value) {
                    return !(value % 2);
                }, scope);
            });

            it("THEN triggers a filter event", function () {
                expect(spy.called).to.equal(true);
            });

            describe("WHEN looping over the items", function () {
                var loopSpy;
                beforeEach(function () {
                    loopSpy = sinon.spy();
                    filter.loop(loopSpy);
                });

                it("THEN only loops through items that match with the filter" +
                    "AND it preserves the indexes", function () {
                    expect(loopSpy.calledWith(0, 0)).to.equal(true);
                    expect(loopSpy.calledWith(1, 1)).to.equal(false);
                    expect(loopSpy.calledWith(2, 2)).to.equal(true);
                    expect(loopSpy.calledWith(3, 3)).to.equal(false);
                    expect(loopSpy.calledWith(4, 4)).to.equal(true);
                });
            });

            describe("WHEN getting the count", function () {
                var count;
                beforeEach(function () {
                    count = filter.count();
                });

                it("Then only counts the items that match with the filter", function () {
                    expect(count).to.equal(3);
                });
            });

            describe("WHEN clearing the filter", function () {
                beforeEach(function () {
                    filter.clearFilter();
                });

                it("THEN triggers another filter event", function () {
                    expect(spy.calledTwice).to.equal(true);
                });

                describe("WHEN looping over the items", function () {
                    var loopSpy;
                    beforeEach(function () {
                        loopSpy = sinon.spy();
                        filter.loop(loopSpy);
                    });

                    it("THEN loops through all the items again", function () {
                        expect(loopSpy.calledWith(0, 0)).to.equal(true);
                        expect(loopSpy.calledWith(1, 1)).to.equal(true);
                        expect(loopSpy.calledWith(2, 2)).to.equal(true);
                        expect(loopSpy.calledWith(3, 3)).to.equal(true);
                        expect(loopSpy.calledWith(4, 4)).to.equal(true);
                    });
                });

                describe("WHEN getting the count", function () {
                    var count;
                    beforeEach(function () {
                        count = filter.count();
                    });

                    it("Then returns the full count", function () {
                        expect(count).to.equal(5);
                    });
                });
            });
        });
    });

});