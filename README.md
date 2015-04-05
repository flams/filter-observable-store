# Filter-observable-store

Filter down an observable store https://github.com/flams/observable-store.

A filtered observable-store will:
- Return a `count` of items that match the filter
- Only `loop` over items that match the filter
- Only trigger events on items that match the filter

## Installation

```bash
npm install filter-observable-store
```

## How to use

```bash
var Store = require("observable-store");
var Filter = require("filter-observable-store");

var store = new Store([5, 10, 15]);

// Create a new filter around an existing store
var filter = new Filter(store);


// Set a filter function
filter.setFilter(function (value) {
    return value >= 10;
}, scope);

// Get filtered count:
filter.count(); // 2

// Loop over filtered items
filter.loop(function (value) {
    // value... 10, 15...
});

// Clear filter
filter.clearFilter();

```

## Changelog

### 0.0.1 - 5 APR 2015

* first release

## License:

MIT