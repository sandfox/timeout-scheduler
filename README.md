# sandfox-timeout-scheduler

Forked off the original [timeout-scheduler](https://github.com/nherment/timeout-scheduler) with some fixes and changes.

This module is a way of scheduling alot of timeouts without creating alot of `timers`. It still uses `setTimeout` underneath.

## Usage

Timeouts are created/scheduled by calling `schedule` with a `key`, `delay`, and optionally some data.
- The `key` can be anything and is not limited to being a string (we're using es6 maps under the hood).
- The `delay` is how far in the future in milliseconds to schedule the timeout.
- The optional data can also be anything

When the timeout is reached a `timeout` event is emitted by the scheduler and that contains the `key`
and any optional data for the `timeout`.

This module is subject to all the limitations and guarantees of the Nodejs/iojs timers module.

```
    var Scheduler = require('sandfox-timeout-scheduler');

    var scheduler = new Scheduler();

    scheduler.on('timeout', function(key, data) {
        // will trigger after around 2 and 3 seconds one the below items are added
    });

    scheduler.schedule('key1', 2000);
    scheduler.schedule('key2', 3000, {foo: 'bar'}); // optionally attach data to the scheduled timeout
    scheduler.schedule('key3', 4000);

    scheduler.cancel('key3');

    schedule.has('key1'); // true

    schedule.has('key3'); // false
```

