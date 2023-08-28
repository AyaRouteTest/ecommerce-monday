import { Router } from "express";
import { isAuthenticated } from "./../../middleware/authentication.middleware.js";
import { isAuthorized } from "./../../middleware/authorization.middleware.js";
import { isValid } from "./../../middleware/validation.middleware.js";
import {
  createCouponSchema,
  deleteCouponSchema,
  updateCouponSchema,
} from "./coupon.validation.js";
import {
  createCoupon,
  updateCoupon,
  allCoupons,
  deleteCoupon,
} from "./coupon.controller.js";
const router = Router();

// Create coupon
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(createCouponSchema),
  createCoupon
);

// Update coupon
router.patch(
  "/:code",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(updateCouponSchema),
  updateCoupon
);

// all coupons
router.get("/", isAuthenticated, isAuthorized("admin"), allCoupons);

// delete coupons
router.delete(
  "/:code",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(deleteCouponSchema),
  deleteCoupon
);

export default router;
