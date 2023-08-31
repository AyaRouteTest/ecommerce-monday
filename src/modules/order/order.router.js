import { Router } from "express";
import { isAuthenticated } from "./../../middleware/authentication.middleware.js";
import { isValid } from "./../../middleware/validation.middleware.js";
import { cancelOrderSchema, createOrderSchema } from "./order.validation.js";
import { createOrder, cancelOrder, orderWebhook } from "./order.controller.js";
const router = Router();

// create order
router.post("/", isAuthenticated, isValid(createOrderSchema), createOrder);

// cancel order
router.patch(
  "/:orderId",
  isAuthenticated,
  isValid(cancelOrderSchema),
  cancelOrder
);

// webhook
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  orderWebhook
);

export default router;
