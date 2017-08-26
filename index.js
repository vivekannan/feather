'use strict';

const utils = require('./utils.js');

const EventEmitter = require('events').EventEmitter;

class Feather extends EventEmitter {
  constructor(options) {
    super();

    /**
     *  Merge the options to the object itself for easier access.
     *  Hopefully this should not overwrite existing keys in the
     *  object as options are validated.
     */
    Object.assign(this, utils.validate(options || {}));

    this.bucket = {};
    this.initialized = false;

    /**
     *  Start polling from the beginning of the next loop
     *  so that listeners can be added.
     */
    setImmediate(() => this.poll());
  }

  poll() {
    return this.refresher((fresh) => {
      this.updateBucket(fresh);

      /**
       *  Poll again only after the current poll finishes.
       */
      setTimeout(() => this.poll(), this.refreshInterval);
    });
  }

  updateBucket(fresh) {
    if (typeof fresh !== 'object') {
      return setImmediate(() => this.emit('error', new Error('Latest feature set missing!')));
    }

    Object.keys(fresh).forEach((feature) => {
      var previousState, currentState;

      if (feature in this.bucket) {
        currentState = !!fresh[feature].enabled;
        previousState = !!this.bucket[feature].enabled;

        if (previousState !== currentState) {
          setImmediate(() => this.emit('toggled', feature, currentState));
        }
      }

      this.bucket[feature] = Object.assign({}, fresh[feature]);
    });

    /**
     *  Emit the `initialized` event after the first bucket update
     *  so that the process can start.
     */
    if (!this.initialized) {
      this.initialized = true;
      this.emit('initialized', fresh);
    }
  }

  isEnabled(key) {
    const feature = this.bucket[key];

    return !!(feature && feature.enabled === true);
  }
}

module.exports = Feather;
