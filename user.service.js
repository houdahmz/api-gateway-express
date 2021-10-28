const uuidv4 = require('uuid/v4');
const { validate } = require('../../../lib/schemas');
const userDao = require('./user.dao.js');
const applicationService = require('./application.service.js');
const credentialService = require('../credentials/credential.service.js');
const config = require('../../config');
const utils = require('../utils');

const SCHEMA = 'http://express-gateway.io/models/users.json';

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

  return userDao
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
s.findAll = function (query) {
  return userDao.findAll(query).then(data => {
    data.users = data.users || [];
    data.users.forEach(u => { u.isActive = u.isActive === 'true'; });
    return data;
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
s.findByUsernameOrId = function (value) {
  return s
    .find(value)
    .then(user => {
      if (user) {
        return user;
      }
      return s.get(value);
    });
};

s.update = function (userId, _props) {
  if (!_props || !userId) {
    return Promise.reject(new Error('invalid user id')); // TODO: replace with validation error
  }
  return this.get(userId) // validate user exists
    .then(user => {
      if (!user) { return false; } // user does not exist

      delete _props.username;
      return validateUpdateToUserProperties(_props)
        .then(function (updatedUserProperties) {
          if (updatedUserProperties) {
            utils.appendUpdatedAt(updatedUserProperties);
            return userDao.update(userId, updatedUserProperties);
          } else return true; // there are no properties to update
        })
        .then(updated => {
          return updated ? true : Promise.reject(new Error('user update failed')); // TODO: replace with server error
        });
    });
};

s.deactivate = function (id) {
  return this.get(id) // make sure user exists
    .then(function () {
      return userDao.deactivate(id)
        .then(() => applicationService.deactivateAll(id)); // Cascade deactivate all applications associated with the user
    })
    .then(() => true)
    .catch(() => Promise.reject(new Error('failed to deactivate user')));
};

s.activate = function (id) {
  return this.get(id) // make sure user exists
    .then(function () {
      return userDao.activate(id);
    })
    .then(() => true)
    .catch(() => Promise.reject(new Error('failed to activate user')));
};

s.remove = function (userId) {
  return this.get(userId) // validate user exists
    .then(user => Promise.all([user, !user ? false : userDao.remove(userId)]))
    .then(([user, userDeleted]) => {
      if (!user) {
        return false;
      } else if (user && !userDeleted) {
        throw new Error('user delete failed');
      } else {
        return Promise.all([
          applicationService.removeAll(userId), // Cascade delete all apps associated with user
          credentialService.removeAllCredentials(user.id)
        ]).then(() => true);
      }
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

function validateUpdateToUserProperties (userProperties) {
  const updatedUserProperties = {};
    // return  Promise.resolve(updatedUserProperties) 

  if (!Object.keys(userProperties).every(key => typeof key === 'string' && config.models.users.properties[key])) {
    
    return Promise.reject(new Error('one or more properties is invalid')); // TODO: replace with validation error
  }

  for (const prop in userProperties) {
    if (config.models.users.properties[prop].isMutable !== false) {
      updatedUserProperties[prop] = userProperties[prop];
    } else return Promise.reject(new Error('one or more properties is immutable')); // TODO: replace with validation error
  }

  return Object.keys(updatedUserProperties).length > 0 ? Promise.resolve(updatedUserProperties) : Promise.resolve(false);
}

module.exports = s;
