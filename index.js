/**
 * filter-observable-store - https://github.com/flams/filter-observable-store
 * Copyright(c) 2015 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */
"use strict";

module.exports = function Filter(observableStore) {
    if (!isObservableStore(observableStore)) {
        throw new TypeError("Filter needs to be initialized with a valid observable store");
    }

    var _storeObservable = observableStore.getStoreObservable();
    var _predicate = getDefaultPredicate();

    return extend(observableStore, {
        setFilter: function (filterFn, scope) {
            _predicate = getPredicate(filterFn, scope);

            _storeObservable.notify("filter");
        },

        loop: function (fn, scope) {
            observableStore.loop(function (value) {
                if (_predicate(value)) {
                    fn.apply(scope, arguments);
                }
            });
        },

        count: function () {
            return observableStore
                .dump()
                .filter(_predicate)
                .length;
        }
    });

};

function isObservableStore(store) {
    return [
        "count",
        "loop",
        "watch",
        "watchValue"].every(function (fn) {
        return typeof store[fn] == "function";
    });
}

function extend(obj, fns) {
    return Object.create(obj, Object.keys(fns)
        .reduce(function (memo, name) {
            memo[name] = {
                value: fns[name]
            };
            return memo;
        }, {}));
}

function getDefaultPredicate() {
    return function () { return true };
}

function getPredicate(fn, scope) {
    return function (value) {
      return fn.call(scope, value);
    };
}