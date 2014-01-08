

    var Scheduler = require('timeout-scheduler');

    var scheduler = new Scheduler();

    scheduler.on('timeout', function(key, data) {
        // will trigger after around 2 and 3 seconds
    });

    scheduler.schedule('key1', 2000);
    scheduler.schedule('key2', 3000, {foo: 'bar'}); // attach data to the scheduled timeout
    scheduler.schedule('key3', 4000);

    scheduler.cancel('key3');

    schedule.has('key1'); // true

    schedule.has('key3'); // false
