'use strict';
const yup = require('yup');
const {checkIfFilesAreTooBig, checkIfFilesAreCorrectType} = require('../helpers/validation');

const schema = yup.object({
  body: yup.object({
    commercial_register: yup.string().required('commercial_register is a required field'),
    accounting_code: yup.string(),
    city: yup.string().notRequired().trim().min(2, "City must be more than one character"),
    zip_code: yup.string(),
    adresse: yup.string(),
    id_commercial: yup.string().required('id_commercial is a required field').matches(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i, "id_commercial should only be UUID v4 "),
    patent: yup.array('patent should be an array').of(yup.string('patent should be an array of string').required('patent is a required field')).required('patent is a required field')
    .test('is-big-file', 'patent file is too large (file > 2MB)', checkIfFilesAreTooBig)      
    .test('is-correct-file', 'patent Field has a wrong type', checkIfFilesAreCorrectType),
    // patent: yup.array('patent should be an array').required('patent is a required field'),
    images: yup.array('images should be an array')
    .test('is-big-file', 'images file is too large (file > 2MB)', checkIfFilesAreTooBig)      
    .test('is-correct-file', 'images Field has a wrong type', checkIfFilesAreCorrectType),
    pos: yup.string(),
    activity: yup.array(),



  }),
});
const patchSchema = yup.object({
  body: yup.object({
    commercial_register: yup.string().required('commercial_register is a required field'),
    accounting_code: yup.string().required('accounting_code is a required field'),
    city: yup.string().required('city is a required field'),
    zip_code: yup.string().required('zip_code is a required field'),
    adresse: yup.string().required('adresse is a required field'),
    id_commercial: yup.string().required('id_commercial is a required field'),


  }),
});
const putSchema = yup.object({
  body: yup.object({
    commercial_register: yup.string().required('commercial_register is a required field'),
    accounting_code: yup.string().required('commercial_register is a required field'),
    city: yup.string().required('commercial_register is a required field'),
    zip_code: yup.string().required('commercial_register is a required field'),
    adresse: yup.string().required('commercial_register is a required field'),
    CategoryId: yup.string().required('CategoryId is a required field').matches(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i, 'typeId should only be UUID v4 '),
    patent: yup.array('patent should be an array').of(yup.string('patent should be an array of string').required('patent is a required field')).required('patent is a required field')
    .test('is-big-file', 'patent file is too large (file > 2MB)', checkIfFilesAreTooBig)      
    .test('is-correct-file', 'patent Field has a wrong type', checkIfFilesAreCorrectType),
    image: yup.array('image should be an array').of(yup.string('image should be an array of string').required('image is a required field')).required('image is a required field'),

  }),
});
const validation = {
  schemaCompany: schema,
  patchSchema: patchSchema,
  putSchema: putSchema,
};
module.exports = validation;
