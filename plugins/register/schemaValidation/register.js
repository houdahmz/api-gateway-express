'use strict';
const yup = require('yup');

const schema = yup.object({
  body: yup.object({
    firstname: yup.string().required('firstname is a required field').matches(/^[a-z]*$/,'firstname should be only letters'),
    lastname: yup.string().required('lastname is a required field').matches(/^[a-z]*$/,'lastname should be only letters'),
    username: yup.string().required('username should not be empty').required('username is a required field'),
    email: yup.string().required('Email should not be empty').email('Email should be valid').min(9,'Email must have atleast 9 char').max(40,'Less than 40 char'),
    phone: yup.string().required('Phone number should not empty').min(8,'phone number should be 8 digit').max(8,'phone number should be 8 digit').matches(/^[0-9]*$/,'phone should be digit'),
    // password: yup.string().required('Password should not be empty').min(6,'Password should have atleast 4 char').max(15,'max char 15'),
    }),
});
const teamSchema = yup.object({
  body: yup.object({
    firstname: yup.string().required('firstname is a required field').matches(/^[a-z]*$/,'firstname should be only letters'),
    lastname: yup.string().required('lastname is a required field').matches(/^[a-z]*$/,'lastname should be only letters'),
    username: yup.string().required('username should not be empty').required('username is a required field'),
    email: yup.string().required('Email should not be empty').email('Email should be valid').min(9,'Email must have atleast 9 char').max(40,'Less than 40 char'),
    phone: yup.string().required('Phone number should not empty').min(8,'phone number should be 8 digit').max(8,'phone number should be 8 digit').matches(/^[0-9]*$/,'phone should be digit'),
    type_userId: yup.string().required('type_userId is a required field').matches(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i, 'type_userId should only be UUID v4 '),
    role: yup.string().required('role is a required field'),
    }),
});
const adminSchema = yup.object({
  body: yup.object({
    firstname: yup.string().required('firstname is a required field').matches(/^[a-z]*$/,'firstname should be only letters'),
    lastname: yup.string().required('lastname is a required field').matches(/^[a-z]*$/,'lastname should be only letters'),
    username: yup.string().required('username should not be empty').required('username is a required field'),
    email: yup.string().required('Email should not be empty').email('Email should be valid').min(9,'Email must have atleast 9 char').max(40,'Less than 40 char'),
    phone: yup.string().required('Phone number should not empty').min(8,'phone number should be 8 digit').max(8,'phone number should be 8 digit').matches(/^[0-9]*$/,'phone should be digit'),
    }),
});
const resetSchema = yup.object({
  body: yup.object({
    password: yup.string().required('Password should not be empty').min(6,'Password should have atleast 4 char').max(15,'max char 15'),
    password_confirmation: yup.string().required('Confirm password is required').oneOf([yup.ref('password'),
'Password does not match']),
  }),
  query: yup.object({
      username: yup.string().required('username should not be empty').required('username is a required field'),
      token: yup.string().required('token is a required field'),

      }),
  
});

const patchSchema = yup.object({
  body: yup.object({
    label: yup.string(),
    image: yup.string(),
  }),
});
const putSchema = yup.object({
  body: yup.object({
    label: yup.string().required('label is a required field'),
    image: yup.string().required('image is a required field'),
  }),
});

const validation = {
    schema: schema,
    patchSchema: patchSchema,
    putSchema: putSchema,
    teamSchema: teamSchema,
    adminSchema: adminSchema,
    resetSchema: resetSchema,


};
module.exports = validation;

