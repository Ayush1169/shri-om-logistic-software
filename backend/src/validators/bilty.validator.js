import Joi from "joi";

export const createBiltySchema = Joi.object({
  branchId: Joi.number().integer().positive().required().messages({
    "any.required": "Branch is required",
    "number.base": "Branch ID must be a number",
  }),

  consignorId: Joi.number().integer().positive().required().messages({
    "any.required": "Consignor is required",
    "number.base": "Consignor ID must be a number",
  }),

  consigneeId: Joi.number().integer().positive().required().messages({
    "any.required": "Consignee is required",
    "number.base": "Consignee ID must be a number",
  }),

  vehicleId: Joi.number().integer().positive().allow(null),

  driverId: Joi.number().integer().positive().allow(null),

  pickupAddress: Joi.string().trim().max(255).required().messages({
    "any.required": "Pickup address is required",
  }),

  deliveryAddress: Joi.string().trim().max(255).required().messages({
    "any.required": "Delivery address is required",
  }),

  goodsDescription: Joi.string().trim().max(255).required().messages({
    "any.required": "Goods description is required",
  }),

  packageCount: Joi.number().integer().min(1).required().messages({
    "any.required": "Package count is required",
  }),

  actualWeight: Joi.number().min(0).allow(null),

  chargeableWeight: Joi.number().min(0).allow(null),

  freight: Joi.number().min(0).required().messages({
    "any.required": "Freight is required",
  }),

  gst: Joi.number().min(0).allow(null),

  hamali: Joi.number().min(0).allow(null),

  loadingCharges: Joi.number().min(0).allow(null),

  unloadingCharges: Joi.number().min(0).allow(null),

  insuranceCharges: Joi.number().min(0).allow(null),

  paymentType: Joi.string()
    .valid("PAID", "TO_PAY", "BILLING")
    .required()
    .messages({
      "any.only": "Invalid payment type",
      "any.required": "Payment type is required",
    }),

  eWayBillNumber: Joi.string().trim().max(100).allow("", null),

  remarks: Joi.string().trim().max(500).allow("", null),
});

export const updateBiltySchema = createBiltySchema.fork(
  [
    "branchId",
    "consignorId",
    "consigneeId",
    "pickupAddress",
    "deliveryAddress",
    "goodsDescription",
    "packageCount",
    "freight",
    "paymentType",
  ],
  (field) => field.optional()
);