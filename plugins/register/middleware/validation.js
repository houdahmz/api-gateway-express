
const statusCode = require('../config');
const util = require('../helpers/utils');

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validate({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    return next();
  } catch (err) {
    // console.log(
    //   'err',
    //   err,
    // );
    // More logic goes here
    if (err.type == 'required') {
      util.setError(
        '400',
        `${err.message}`,
        statusCode.CODE_ERROR.EMPTY,
      );
      return util.send(res);
    } else if (err.type == 'matches') {
      util.setError(
        '400',
        `${err.message}`,
        statusCode.CODE_ERROR.TYPE,
      );
      return util.send(res);
    } else if (err.type == 'typeError' || err.type == 'min') {
      util.setError(
        '400',
        `${err.message}`,
        statusCode.CODE_ERROR.TYPE,
      );
    } else {
      util.setError(
        '400',
        `${err.message} (${err.name})`,
        statusCode.CODE_ERROR.OTHER,
      );
    }
    return util.send(res);
  }
};

module.exports = validate;
