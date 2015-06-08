'use strict';

var util = require("util");
var events = require("events");

var Map = require('es6-map');

function Scheduler() {
  events.EventEmitter.call(this);
  this._timeouts = [];
  this._keys = new Map();

  this._timeout = {
    next: null,
    plannedTriggerTime: 0
  };
}

util.inherits(Scheduler, events.EventEmitter);

Scheduler.prototype.schedule = function(key, delay, data) {
  var expiry = Date.now() + delay;

  this._keys.set(key,{
    expiry: expiry,
    data: data
  });

  this._timeouts.push({key: key, expiry: expiry});

  var self = this;
  setImmediate(function() {
    self._sortTimeouts();
  });
};

Scheduler.prototype.has = function(key) {
  return this._keys.has(key);
};

Scheduler.prototype.cancel = function(key) {
  this._keys.delete(key);
  // there is no need to go through the list of timeouts because it will be cleared on the next timeout()
};

// returns the expiry time in JS timestamp and any optional data
Scheduler.prototype.get = function(key) {
  return this._keys.get(key);
};

//Function - because everything else is
Scheduler.prototype.size = function(k) {
  return this._keys.size;
};

Scheduler.prototype._sortTimeouts = function() {
  if(this._timeouts.length > 0) {
    this._timeouts = this._timeouts.sort(sortByTimestamp);

    // only re-schedule the timeout if the new one is later (ie. don't fire for nothing)
    if(this._timeouts[0].expiry > this._timeout.plannedTriggerTime) {
      this._rescheduleNextTimeout(this._timeouts[0].expiry);
    }
  }
};

Scheduler.prototype._rescheduleNextTimeout = function(expiry) {
  if(this._timeout.next) {
    clearTimeout(this._timeout.next);
  }
  var self = this;
  //Why are we always running at least every second?
  var delay = Math.min(expiry - Date.now(), 1000);
  this._timeout.plannedTriggerTime = expiry;
  this._timeout.next = setTimeout(function() {

    self._timeout.next = null;
    self._internalTimeout();
  }, delay);
};

Scheduler.prototype._timeoutItem = function(item) {
  // Only 'timeout' an item if it was triggered at the time it was expecting
  // While not great this should protect against https://github.com/sandfox/timeout-scheduler/issues/1
  if(this._keys.has(item.key) && item.expiry === this._keys.get(item.key).expiry) {
    var data = this._keys.get(item.key).data;
    this._keys.delete(item.key);
    this.emit('timeout', item.key, data);
  }
}

Scheduler.prototype._internalTimeout = function() {
  var now = Date.now();

  while(this._timeouts.length > 0) {
    if(this._timeouts[0].expiry <= now) {
      var tm = this._timeouts.shift();
      this._timeoutItem(tm);
    } else {
      break;
    }
  }

  if(this._timeouts.length > 0) {
    this._rescheduleNextTimeout(this._timeouts[0].expiry);
  }

};

// immediately consider all items in the queue to have timed out and process them
Scheduler.prototype.flush = function() {
  while(this._timeouts.length > 0) {
    var tm = this._timeouts.shift();
    this._timeoutItem(tm);
  }
}

function sortByTimestamp(a, b) {
  return a.expiry - b.expiry;
}

module.exports = Scheduler;