const uuidv4 = require('uuid/v4');
const { validate } = require('express-gateway/lib/schemas');
const userDao = require('./user.dao.js');
const userDaoEG = require('express-gateway/lib/services/consumers/user.dao.js');
const applicationService = require('express-gateway/lib/services/consumers/application.service');
const credentialService = require('express-gateway/lib/services/credentials/credential.service');
const config = require('express-gateway/lib/config');
const utils = require('express-gateway/lib/services/utils');

const SCHEMA = 'http://express-gateway.io/models/users.json';
// const u = {};
// u.user = require('express-gateway/lib/services/consumers/user.service.js');

const s = {};

s.insert = function (user) {
  return validateAndCreateUser(user)
    .then(function (newUser) {
      return userDao.insert(newUser)
        .then(function (success) {
          if (success) {
            newUser.isActive = newUser.isActive === 'true';
            return newUser;
          } else return Promise.reject(new Error('insert user failed')); // TODO: replace with server error
        });
    });
};
s.get = function (userId, options) {

  if (!userId || !typeof userId === 'string') {
    return false;
  }

  return userDaoEG
    .getUserById(userId)
    .then(function (user) {
      if (!user) {
        return false;
      }

      user.isActive = user.isActive === 'true';
      if (!options || !options.includePassword) {
        delete user.password;
      }
      return user;
    });
};
s.getEmail = function (email, options) {
  if (!email || !typeof email === 'string') {
    return false;
  }

  return userDao
    .getUserByEmail(email)
    .then(function (user) {
      if (!user) {
        return false;
      }

      user.isActive = user.isActive === 'true';
      if (!options || !options.includePassword) {
        delete user.password;
      }
      return user;
    });
};
s.getPhone = function (phone, options) {
  if (!phone || !typeof phone === 'string') {
    return false;
  }

  return userDao
    .getUserByEmail(phone)
    .then(function (user) {
      if (!user) {
        return false;
      }

      user.isActive = user.isActive === 'true';
      if (!options || !options.includePassword) {
        delete user.password;
      }
      return user;
    });
};
// s.findAll = function (query) {
//   return userDao.findAll(query).then(data => {
//     data.users = data.users || [];
//     data.users.forEach(u => { u.isActive = u.isActive === 'true'; });
//     return data;
//   });
// };

s.findEmail = function (email, options) {
  if (!email || !typeof email === 'string') {
    return Promise.reject(new Error('invalid email')); // TODO: replace with validation error
  }
  return userDao
    .findEmail(email)
    .then(userId => {
      return userId ? this.get(userId, options) : false;
    });
};

s.findByEmail = function (value) {
    return s
    .findEmail(value)
    .then(user => {
      if (user) {
        return user;
      }
      return s.get(value);
    });


};
s.findPhone = function (phone, options) {
  if (!phone || !typeof phone === 'string') {
    return Promise.reject(new Error('invalid phone')); // TODO: replace with validation error
  }
  return userDao
    .findPhone(phone)
    .then(userId => {
      return userId ? this.get(userId, options) : false;
    });
};

s.findByPhone = function (value) {
    return s
    .findPhone(value)
    .then(user => {
      if (user) {
        return user;
      }
      return s.get(value);
    });
};
s.find = function (username, options) {

  if (!username || !typeof username === 'string') {
    return Promise.reject(new Error('invalid username')); // TODO: replace with validation error
  }

  return userDao
    .find(username)
    .then(userId => {
      return userId ? this.get(userId, options) : false;
    });
};
s.findAll = function (query) {
  console.log("query",query)
  return userDao.findAll(query).then(data => {
    console.log("data",data)
    data.users = data.users || [];
    // data.users.forEach(u => { u.isActive = u.isActive === 'true'; });
    return data;
  });
};
function validateAndCreateUser (_user) {
  let user;

  const result = validate(SCHEMA, _user);
  if (!result.isValid) {
    return Promise.reject(new Error(result.error));
  }

  return s.find(_user.username) // Ensure username is unique
    .then(function (exists) {
      if (exists) {
        throw new Error('username already exists');
      }
      return s.findEmail(_user.email) // Ensure email is unique
      .then(function (exists) {
        if (exists) {
          throw new Error('email already exists');
        }
        return s.findPhone(_user.phone) // Ensure phone is unique
        .then(function (exists) {
          if (exists) {
            throw new Error('phone already exists');
          }
          return _user;
        })
      })  
    })
    .then(function (newUser) {
      const baseUserProps = { isActive: 'true', username: _user.username, id: uuidv4() };
      if (newUser) {
        user = Object.assign(baseUserProps, newUser);
      } else user = baseUserProps;

      utils.appendCreatedAt(user);
      utils.appendUpdatedAt(user);

      return user;
    });
}
module.exports = s;
