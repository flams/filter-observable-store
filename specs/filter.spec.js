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

        describe("WHEN testing if the model has a specific value", function () {
            var has, hasNot;
            beforeEach(function () {
                has = filter.has(3);
                hasNot = filter.has(10);
            });

            it("THEN tells if it doesn't have a specific value", function () {
                expect(has).to.equal(true);
            });

            it("THEN tells if does have a specific value", function () {
                expect(hasNot).to.equal(false);
            });
        });

        describe("WHEN setting a filter to get the even values", function () {
            var spy, scope = {};

            beforeEach(function () {
                spy = sinon.spy();

                filter.watch("filtered", spy);
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

            describe("WHEN subscribing to events on specific values", function () {
                var eventSpy0, eventSpy1;
                beforeEach(function () {
                    eventSpy0 = sinon.spy();
                    eventSpy1 = sinon.spy();
                    filter.watchValue(0, eventSpy0);
                    filter.watchValue(1, eventSpy1);

                    filter.set(0, 10);
                    filter.set(1, 11);
                });

                it("THEN triggers an updated event if the value matches with the filter", function () {
                    expect(eventSpy0.calledWith(10, "updated", 0)).to.equal(true);
                });

                it("THEN doesn't trigger an updated event if the value doesn't match", function () {
                    expect(eventSpy1.called).to.equal(false);
                });
            });

            describe("WHEN subscribing to generic events on the array", function () {
                var eventSpyAdded, eventSpyUpdated, eventSpyDeleted;

                beforeEach(function () {
                    eventSpyAdded = sinon.spy();
                    eventSpyUpdated = sinon.spy();
                    eventSpyDeleted = sinon.spy();

                    filter.watch("added", eventSpyAdded);
                    filter.watch("updated", eventSpyUpdated);
                    filter.watch("deleted", eventSpyDeleted);

                    filter.alter("push", 5);
                    filter.alter("push", 6);

                    filter.set(5, 20);
                    filter.set(6, 21);

                    filter.alter("pop");
                    filter.alter("pop");
                });

                it("THEN doesn't trigger an added event for new items that don't match", function () {
                    expect(eventSpyAdded.calledWith(5, 5)).to.equal(false);
                });

                it("THEN triggers an added event for new items that match", function () {
                    expect(eventSpyAdded.calledWith(6, 6)).to.equal(true);
                });

                it("THEN triggers an add event for updated items that match", function () {
                    expect(eventSpyAdded.calledWith(5, 20)).to.equal(true);
                });

                it("THEN doesn't trigger an updated event for new items that don't match", function () {
                    expect(eventSpyUpdated.calledWith(6, 21)).to.equal(false);
                });

                it("THEN triggers a deleted event for deleted items that matched", function () {
                    expect(eventSpyDeleted.calledWith(5)).to.equal(true);
                });

                it("THEN doesn't trigger a deleted event for deleted items that didn't match", function () {
                    expect(eventSpyDeleted.calledWith(6)).to.equal(false);
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

            describe("WHEN testing if the filtered model has a specific value", function () {
                var has, hasNot;
                beforeEach(function () {
                    has = filter.has(2);
                    hasNot = filter.has(3);
                });

                it("THEN tells if it doesn't have a specific value", function () {
                    expect(has).to.equal(true);
                });

                it("THEN tells if does have a specific value", function () {
                    expect(hasNot).to.equal(false);
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