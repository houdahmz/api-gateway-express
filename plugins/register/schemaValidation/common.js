'use strict';
const yup = require('yup');

const createdSchema = yup.object({
  body: yup.object({
    created_by: yup.string().required('created_by is a required field').matches(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i, "created_by should only be UUID v4 "),
  }),
});
const updatedSchema = yup.object({
  body: yup.object({
    updated_by: yup.string().required('updated_by is a required field').matches(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i, "updated_by should only be UUID v4 "),
  }),
});
const deletedSchema = yup.object({
  body: yup.object({
    deleted_by: yup.string().required('deleted_by is a required field').matches(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i, "deleted_by should only be UUID v4 "),
  }),
});
const idUserSchema = yup.object({
  body: yup.object({
      id_user: yup.string().required('id_user is a required field').matches(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i, "id_user should only be UUID v4 "),
  }),
});
const idOwnerSchema = yup.object({
  body: yup.object({
    owner_id: yup.string().required('owner_id is a required field').matches(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i, "id_user should only be UUID v4 "),
  }),
});

const schema = {
  createdSchema: createdSchema,
  updatedSchema: updatedSchema,
  deletedSchema: deletedSchema,
  idUserSchema: idUserSchema,
  idOwnerSchema: idOwnerSchema,

};
module.exports = schema;

