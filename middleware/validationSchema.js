const { body } = require("express-validator");

const validationSchema = () => {
  return [body("title").notEmpty(), body("price").notEmpty()];
};

module.exports = {
  validationSchema,
};
