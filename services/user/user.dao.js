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
  console.log("redisUserKey",redisUserKey)
  console.log("redisUsernameSetKey",redisUsernameSetKey)

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
dao.findAll = function ({ start = 0, count = '5000' } = {}) {
  const key = config.systemConfig.db.redis.namespace.concat('-', usernameNamespace).concat(':');
  console.log("start",start) //start 0

  console.log("key",key) //key EG-user: 

  console.log("count",count)
  return db.scan(start, 'MATCH', `EG-username:test8*`, 'COUNT', count).then(resp => {
    console.log("iciii key") //key EG-user: 

    const nextKey = parseInt(resp[0], 10);
    const userKeys = resp[1];
    if (!userKeys || userKeys.length === 0) return Promise.resolve({ users: [], nextKey: 0 });
    const promises = userKeys.map(key => {
      console.log("resp[1]",resp) //key EG-user: 
      if(key == "EG-username:test8"){
        console.log("iciii key") //key EG-user: 
      }
      db.hgetall(key).then(tt => {
        console.log("tt",tt) //key EG-user: 

      })
    });
    return Promise.all(promises).then(users => {
      return {
        users,
        nextKey
      };
    });
  });
};module.exports = dao;
