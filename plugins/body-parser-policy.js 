const { PassThrough } = require("stream");
const jsonParser = require("express").json();
const urlEncodedParser = require("express").urlencoded({ extended: true });

module.exports = {
  name: 'body-parser',
  schema: {
    $id: 'N/A',
    type: 'object',
    properties: {}
  },
  policy: () => {
    return async (req, res, next) => {
      req.egContext.requestStream = new PassThrough();
      req.pipe(req.egContext.requestStream);
      return jsonParser(req, res, () => urlEncodedParser(req, res, next));
    };
  }
};