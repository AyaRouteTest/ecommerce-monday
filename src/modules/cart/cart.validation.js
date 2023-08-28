import joi from "joi";
import { isValidObjectId } from "./../../middleware/validation.middleware.js";
// add to cart
export const addTocartSchema = joi
  .object({
    productId: joi.string().custom(isValidObjectId).required(),
    quantity: joi.number().integer().min(1).required(),
  })
  .required();

// update cart
export const updateCartSchema = joi
  .object({
    productId: joi.string().custom(isValidObjectId).required(),
    quantity: joi.number().integer().min(1).required(),
  })
  .required();

// remove from cart
export const removeFromCartSchema = joi
  .object({
    productId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
