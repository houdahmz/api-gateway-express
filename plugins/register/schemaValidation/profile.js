'use strict';
const yup = require('yup');
const {checkIfFilesAreTooBig, checkIfFileIsTooBig, checkIfFileIsCorrectType, checkIfFilesAreCorrectType} = require('../helpers/validation');

const schema = yup.object().shape({
  body: yup.object({
    first_name: yup.string(),
    last_name: yup.string(),
    phone: yup.string().matches(/^[0-9]+$/, 'Must be only digits').min(8, 'Must be exactly 8 digits')
    .max(8, 'Must be exactly 8 digits'),
    typeId: yup.string().required('typeId is a required field').matches(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i, 'typeId should only be UUID v4 '),
    cin: yup.array('cin should be an array').of(yup.string('cin should be an array of string').required('cin is a required field')).required('cin is a required field')
    .test('is-big-file', 'Cin file is too large (file > 2MB)', checkIfFilesAreTooBig)      
    .test('is-correct-file', 'Cin Field has a wrong type', checkIfFilesAreCorrectType),
    photo: yup.string()     
    .test('fileSize', 'Photo file is too large',checkIfFileIsTooBig)
    .test('isCorrectFile', 'Photo field has a wrong type',checkIfFileIsCorrectType),
  }),
});
const profileSchema = yup.object().shape({
  body: yup.object({
    first_name: yup.string(),
    last_name: yup.string(),
    phone: yup.string().matches(/^[0-9]+$/, 'Must be only digits').min(8, 'Must be exactly 8 digits')
    .max(8, 'Must be exactly 8 digits'),
    cin: yup.array('cin should be an array').of(yup.string('cin should be an array of string').required('cin is a required field')).required('cin is a required field')
    .test('is-big-file', 'Cin file is too large (file > 2MB)', checkIfFilesAreTooBig)      
    .test('is-correct-file', 'Cin Field has a wrong type', checkIfFilesAreCorrectType),
    photo: yup.string()     
    .test('fileSize', 'Photo file is too large',checkIfFileIsTooBig)
    .test('isCorrectFile', 'Photo field has a wrong type',checkIfFileIsCorrectType),
    canals: yup.array(),

  }),
});
const patchSchema = yup.object({
  body: yup.object({
    phone: yup.string(),
    photo: yup.string(),
    cin: yup.array('cin should be an array'),

  }),
});
const putSchema = yup.object({
  body: yup.object({
    first_name: yup.string().required('first_name is a required field'),
    last_name: yup.string().required('last_name is a required field'),
    phone: yup.string().required('phone is a required field').matches(/^[0-9]+$/, 'Must be only digits').min(8, 'Must be exactly 8 digits')
    .max(8, 'Must be exactly 8 digits'),
    photo: yup.string().required('photo is a required field'),
    cin: yup.array('cin should be an array').of(yup.string('cin should be an array of string').required('cin is a required field')).required('cin is a required field'),

  }),
});


const validation = {
  schema: schema,
  patchSchema: patchSchema,
  putSchema: putSchema,
  profileSchema: profileSchema,


};
module.exports = validation;

