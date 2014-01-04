'use strict';

var chai = require('chai');
var debug = require('debug')('quotas:test');
var redis = require('redis-url');

var expect = chai.expect;

var Quotas = require('../index');

var config = {
  quotas: {emails: {limit: 100, expires: 3600}, sms: {limit: 100}}, redisUrl: 'redis://localhost'
};

describe('Quotas', function () {

  it('should raise an error if missing quota configuration.', function () {
    var quotas = new Quotas({});
    expect(quotas.initialise).to.throw(Error);
  });

  it('should raise an error if missing redis url configuration.', function () {
    var quotas = new Quotas({quotas: {emails: {limit: 100}, sms: {limit: 100}}});
    expect(quotas.initialise).to.throw(Error);
  });

  it('should load with valid configuration.', function () {
    var quotas = new Quotas(config);
    expect(quotas.initialise).to.not.throw(Error);
  });

  it('should return the correct expiry value.', function () {
    var quotas = new Quotas(config);
    quotas.initialise();

    expect(quotas.expiry('emails')).to.equal(3600);
    expect(quotas.expiry('sms')).to.equal(86400);
  });

  it('should check quota, decrement the value and return the remainder.', function (done) {

    var quotas = new Quotas(config);
    quotas.initialise();
    quotas.flush(function (err, result) {
      debug(err, result);
      expect(err).to.not.exist;
      quotas.check(1234, 'emails', function (err, result) {
        debug(err, result);
        expect(err).to.not.exist;
        expect(result).to.equal(100);
        quotas.check(1234, 'emails', function (err, result) {
          debug(err, result);
          expect(err).to.not.exist;
          expect(result).to.equal(99);
          done();
        });
      });
    });


  });

  it('should use configured redis connection.', function (done) {

    // remove the existing url
    delete config.redisUrl;

    // configure a client
    config.redisClient = redis.connect('redis://localhost');

    var quotas = new Quotas(config);
    quotas.initialise();
    quotas.flush(function (err, result) {
      debug(err, result);
      expect(err).to.not.exist;
      quotas.check(1234, 'sms', function (err, result) {
        debug(err, result);
        expect(err).to.not.exist;
        expect(result).to.equal(100);
        done();
      });
    });


  });

});

