'use strict';

var xtend = require('xtend');
var redis = require('redis-url');
var debug = require('debug')('quotas');
var async = require('async');

var defaults = {
  prefix: 'quotas'
};

var Quotas = function Quotas(options) {

  this.options = xtend(defaults, options);
  var self = this;

  /**
   * Initialise quotas and check all the options are correctly configured.
   *
   * @param {Object} options
   */
  this.initialise = function initialise() {

    if (!self.options.quotas) {
      throw new Error('Missing configuration for quotas to apply.');
    }

    if (!self.options.redisUrl) {
      throw new Error('Missing redis URL configuration option.');
    }

    self.redis = redis.connect(self.options.redisUrl);
  };

  /**
   * Flush all the quotas out of REDIS based on the configured prefix.
   *
   * @param {Function} cb
   */
  this.flush = function flush(cb) {
    self.redis.keys(self.options.prefix + ':*', function (err, replies) {
      debug(replies.length + " replies:");
      var redis = self.redis;

      async.each(replies, redis.del.bind(redis), cb);

    });
  };

  /**
   * Check and decrement the quota.
   *
   * @param {String} uid
   * @param {String} type
   * @param {Function} cb
   */
  this.check = function check(uid, type, cb) {

    if (!uid) throw new Error('Missing uid.');
    if (!type) throw new Error('Missing type.');

    if (!self.options.quotas[type].limit) throw new Error('Missing limit configuration for type', type);

    var key = [self.options.prefix, uid, type].join(':');
    var redis = self.redis;
    var limit = self.options.quotas[type].limit;

    // does the quota exist
    redis.keys(key, function (err, reply) {
      debug('reply', reply);

      if (reply.length === 0) {
        debug('setex', key, 36400, limit);
        redis.setex(key, 36400, limit, cb);
      } else {
        debug('decr', key);
        redis.decr(key, cb);
      }

    });
  };

};

module.exports = Quotas;