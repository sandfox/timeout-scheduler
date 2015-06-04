var Scheduler = require('../Scheduler.js');
var assert = require('assert');

var scheduler;

describe('scheduler', function() {

  before(function() {
    scheduler = new Scheduler();
  })

  afterEach(function() {
    scheduler.removeAllListeners();
  })

  it('timeout should fire at least after the given delay', function(done) {

    this.timeout(500);

    var now = Date.now();
    scheduler.once('timeout', function(key) {
      if(key === 'key1') {
        assert((now + 400) <= Date.now() );
        done();
      }
    });

    scheduler.schedule('key1', 400);
  })

  it('timeout should not fire if cancelled', function(done) {

    this.timeout(1000);

    setTimeout(done, 800);

    var now = Date.now();
    scheduler.once('timeout', function(key) {
      if(key === 'key2') {
        throw new Error('the trigger was cancelled and should not have fired');
      }
    });

    scheduler.schedule('key2', 500);

    setTimeout(function() {
      scheduler.cancel('key2');
    }, 200);
  })

  it('multiple scheduled timeout should fire', function(done) {

    this.timeout(500);

    var now = Date.now();
    var timeoutCount = 0;
    scheduler.on('timeout', function(key) {
      if(key === 'key3') {
        assert((now + 200) <= Date.now() );
        timeoutCount ++;
      }
      if(key === 'key4') {
        assert((now + 400) <= Date.now() );
        timeoutCount ++;
      }
      if(timeoutCount === 2) {
        done()
      }
    });

    scheduler.schedule('key3', 200);
    scheduler.schedule('key4', 400);
  })

  it('cancelled timeout should not impact others', function(done) {

    this.timeout(500);

    var now = Date.now();
    var timeoutCount = 0;
    scheduler.on('timeout', function(key) {
      if(key === 'key5') {
        assert( (now + 200) <= Date.now() );
        timeoutCount ++;
        scheduler.cancel('key6');
      }
      if(key === 'key6') {
        throw new Error('key6 was canceled and should not have fired');
      }
      if(key === 'key7') {
        assert( (now + 400) <= Date.now() );
        timeoutCount ++;
      }
      if(timeoutCount === 2) {
        done();
      }
    });

    scheduler.schedule('key5', 200);
    scheduler.schedule('key6', 300);
    scheduler.schedule('key7', 400);
  })

  it('schedule, cancel, schedule a timeout should fire once and at the last scheduled time', function(done) {

    this.timeout(500);

    var now = Date.now();
    scheduler.on('timeout', function(key) {
      if(key === 'key8') {
        assert( (now + 400) <= Date.now() );
        done();
      }
    });

    scheduler.schedule('key8', 200);
    scheduler.cancel('key8');
    scheduler.schedule('key8', 400);
  })

  it('it should be possible to store data and have it back on timeout', function(done) {

    this.timeout(500);

    var now = Date.now();
    scheduler.once('timeout', function(key, data) {
      if(key === 'key1') {
        assert((now + 400) <= Date.now() );
        assert.deepEqual(data, {'white': 'cat'});
        done();
      }
    });

    scheduler.schedule('key1', 400, {'white': 'cat'});
  })

  it('it should be possible to retrieve a scheduled item by key', function(done) {

    var now = Date.now();

    scheduler.schedule('another_key', 400, {'white': 'cat'});

    var scheduledItem = scheduler.get('another_key');

    assert(scheduledItem.expiry = now + 400);
    assert.deepEqual(scheduledItem.data, {'white': 'cat'});

    done();

  });


})

