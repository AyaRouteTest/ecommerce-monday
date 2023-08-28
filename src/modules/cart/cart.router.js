import { Router } from "express";
import { isAuthenticated } from "./../../middleware/authentication.middleware.js";
import { isValid } from "./../../middleware/validation.middleware.js";
import {
  addTocartSchema,
  removeFromCartSchema,
  updateCartSchema,
} from "./cart.validation.js";
import {
  addToCart,
  userCart,
  updateCart,
  removeFromCart,
  clearCart,
} from "./cart.controller.js";
const router = Router();

// add to cart
router.post("/", isAuthenticated, isValid(addTocartSchema), addToCart);

// get user cart
router.get("/", isAuthenticated, userCart);

// update cart
router.patch("/", isAuthenticated, isValid(updateCartSchema), updateCart);

// remove product from cart
router.patch(
  // localhost:3000/cart/dynamic
  "/:productId",
  isAuthenticated,
  isValid(removeFromCartSchema),
  removeFromCart
);

// clear cart >>> patch
router.put("/clear", isAuthenticated, clearCart);

export default router;
