const Joi = require("joi");

const createDriverSchema = Joi.object({
  driverName: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Driver name is required",
    "string.min": "Driver name must be at least 3 characters",
  }),

  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Mobile number is required",
      "string.pattern.base": "Mobile number must be 10 digits",
    }),

  aadhaarNumber: Joi.string()
    .pattern(/^[0-9]{12}$/)
    .required()
    .messages({
      "string.empty": "Aadhaar number is required",
      "string.pattern.base": "Aadhaar number must be 12 digits",
    }),

  licenseNumber: Joi.string().trim().required().messages({
    "string.empty": "License number is required",
  }),

  address: Joi.string().trim().required().messages({
    "string.empty": "Address is required",
  }),

  emergencyContact: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .allow("", null)
    .messages({
      "string.pattern.base": "Emergency contact must be 10 digits",
    }),

  licenseExpiry: Joi.date().allow(null, ""),

  aadhaarFront: Joi.string().allow("", null),

  aadhaarBack: Joi.string().allow("", null),

  licenseImage: Joi.string().allow("", null),
});

const updateDriverSchema = createDriverSchema;

module.exports = {
  createDriverSchema,
  updateDriverSchema,
};