const expect = require('chai').expect;

describe('Unit Tests for Feature Constructor', function() {
  const Feather = require('../index.js');

  it('throws error when mandatory options are missing', function(done) {
    expect(function() {
      new Feather();
    }).to.throw('Mandatory key "refresher" missing.');

    expect(function() {
      new Feather({
        refresher: {}
      });
    }).to.throw('Mandatory key "refresher" of wrong type. Expected: "function" Got: "object".');

    return done();
  });

  it('fallback to defaults when optional options are missing', function(done) {
    expect(new Feather({
      refresher: function() {}
    }).refreshInterval).to.equal(30000);

    return done();
  });

  it('fires the "error" event when festure set in invalid', function(done) {
    new Feather({
      refresher: function(callback) {
        return callback();
      }
    }).on('error', function(error) {
      expect(error.message).to.equal('Latest feature set missing!');

      return done();
    });
  });

  it('fires the "initialized" event after first refresh', function(done) {
    new Feather({
      refresher: function(callback) {
        return callback({
          someFeature: {}
        });
      }
    }).on('initialized', function(fresh) {
      expect(fresh).to.deep.equal({
        someFeature: {}
      });

      return done();
    });
  });

  it('fires the "toggle" event after second refresh', function(done) {
    var counter = 0;

    new Feather({
      refresher: function(callback) {
        return callback({
          someFeature: {
            enabled: counter++ % 2 === 0
          }
        });
      },
      refreshInterval: 50
    }).once('toggled', function(feature, currentState) {
      expect(feature).to.equal('someFeature');
      expect(currentState).to.equal(false);

      return done();
    });
  });

  it('`isEnabled` works', function(done) {
    var counter = 0;

    const f = new Feather({
      refresher: function(callback) {
        return callback({
          someFeature: {
            enabled: counter++ % 2 === 0
          }
        });
      },
      refreshInterval: 1000
    }).on('initialized', function() {
      expect(f.isEnabled('someFeature')).to.equal(true);
      expect(f.isEnabled('someOtherFeature')).to.equal(false);

      return done();
    }).on('toggled', function(feature, currentState) {
      expect(f.isEnabled(feature)).to.equal(currentState);

      return done();
    });
  });
});