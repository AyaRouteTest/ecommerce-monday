import joi from "joi";
import { isValidObjectId } from "./../../middleware/validation.middleware.js";
// create order Schema
export const createOrderSchema = joi
  .object({
    payment: joi.string().valid("cash", "visa"), // cash visa
    phone: joi.string().required(),
    address: joi.string().min(10).required(),
    coupon: joi.string(),
  })
  .required();

export const cancelOrderSchema = joi
  .object({
    orderId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
