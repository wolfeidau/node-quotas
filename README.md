# node-quotas [![Build Status](https://drone.io/github.com/wolfeidau/node-quotas/status.png)](https://drone.io/github.com/wolfeidau/node-quotas/latest)

This module enables management of quotas in [redis](http://redis.io/).

[![NPM](https://nodei.co/npm/node-quotas.png)](https://nodei.co/npm/node-quotas/)
[![NPM](https://nodei.co/npm-dl/node-quotas.png)](https://nodei.co/npm/node-quotas/)

# API

```javascript
var Quotas = require('quotas');

var config = {
  quotas: {
      emails: {limit: 100}, // limit of 100 emails for the given period
      sms: {limit: 100, expires: 3600} // limit of 100 sms' for the 3600 seconds (5 minutes)
  },
  redisUrl: 'redis://localhost',
  expires: 86400 // default expiry of 1 day
};

var quotas = new Quotas(config);

// initialise and check all the settings.
quotas.initialise();

quotas.check(12345, 'emails', function(err, result) {
    if(err) return cb(err)// do whatever

    // check the result is > 0 and let the operation through
    ...

});
```

# features

* Set default quotas given a unique user identifier, a type and a default value.

# License

Copyright (c) 2014 Mark Wolfe released under the MIT license.