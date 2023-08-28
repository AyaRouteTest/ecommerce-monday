import { Router } from "express";
import { isValid } from "../../middleware/validation.middleware.js";
import {
  activateSchema,
  registerSchema,
  loginSchema,
  forgetCodeSchema,
  resetPasswordSchema,
} from "./auth.validation.js";
import {
  activateAccount,
  register,
  login,
  sendForgetCode,
  resestPassword,
} from "./auth.contoller.js";

const router = Router();

// Register
router.post("/register", isValid(registerSchema), register);

// Activate Account
router.get(
  "/confirmEmail/:activationCode",
  isValid(activateSchema),
  activateAccount
);

// Login
router.post("/login", isValid(loginSchema), login);

// send forget password code
router.patch("/forgetCode", isValid(forgetCodeSchema), sendForgetCode);

// Reset Password
router.patch("/resetPassword", isValid(resetPasswordSchema), resestPassword);

export default router;
