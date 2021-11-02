const db = require('express-gateway/lib/db');
const config = require('express-gateway/lib/config');
const userDaoEG = require('express-gateway/lib/services/consumers/user.dao.js');

const dao = {};
const userNamespace = 'user';
const usernameNamespace = 'username';
const emailNamespace = 'email';
const phoneNamespace = 'phone';

dao.insert = function (user) {
  // key for the user hash table
  const redisUserKey = config.systemConfig.db.redis.namespace.concat('-', userNamespace).concat(':', user.id);

  // name for the user's username set
  const redisUsernameSetKey = config.systemConfig.db.redis.namespace.concat('-', usernameNamespace).concat(':', user.username);

  const redisEmailSetKey = config.systemConfig.db.redis.namespace.concat('-', emailNamespace).concat(':', user.email);
  const redisPhoneSetKey = config.systemConfig.db.redis.namespace.concat('-', phoneNamespace).concat(':', user.phone);


  return db
    .multi()
    .hmset(redisUserKey, user)
    .sadd(redisUsernameSetKey, user.id)
    .sadd(redisEmailSetKey, user.id)
    .sadd(redisPhoneSetKey, user.id)
    .exec()
    .then(res => res.every(val => val));
};

dao.getUserByEmail = function (email) {
  return db.hgetall(config.systemConfig.db.redis.namespace.concat('-', emailNamespace).concat(':', email))
    .then(function (user) {
      if (!user || !Object.keys(user).length) {
        return false;
      }
      return user;
    });
};

dao.getUserByPhone = function (phone) {
  return db.hgetall(config.systemConfig.db.redis.namespace.concat('-', phoneNamespace).concat(':', phone))
    .then(function (user) {
      if (!user || !Object.keys(user).length) {
        return false;
      }
      return user;
    });
};

dao.findEmail = function (email) {
  return db.smembers(config.systemConfig.db.redis.namespace.concat('-', emailNamespace).concat(':', email))
    .then(function (Ids) {
      if (Ids && Ids.length !== 0) {
        return Ids[0];
      } else return false;
    });
};
dao.findPhone = function (phone) {
  return db.smembers(config.systemConfig.db.redis.namespace.concat('-', phoneNamespace).concat(':', phone))
    .then(function (Ids) {
      if (Ids && Ids.length !== 0) {
        return Ids[0];
      } else return false;
    });
};
dao.find = function (username) {
  return db.smembers(config.systemConfig.db.redis.namespace.concat('-', usernameNamespace).concat(':', username))
    .then(function (Ids) {
      if (Ids && Ids.length !== 0) {
        return Ids[0];
      } else return false;
    });
};

module.exports = dao;
