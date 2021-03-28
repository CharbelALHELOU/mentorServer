const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateMentorInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.category = !isEmpty(data.category) ? data.category : "";

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Mentor name must be between 2 and 30 characters";
  }

  if (!Validator.isLength(data.category, { min: 2, max: 30 })) {
    errors.category = "Category must be between 2 and 30 characters";
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = "Mentor name field is required";
  }

  if (Validator.isEmpty(data.category)) {
    errors.category = "Category field is required";
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
};
