import { Router } from "express";
import { isValid } from "./../../middleware/validation.middleware.js";
import {
  createbrandSchema,
  updatebrandSchema,
  deletebrandSchema,
} from "./brand.validation.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import {
  createBrand,
  updateBrand,
  deleteBrand,
  allBrands,
} from "./brand.controller.js";
const router = Router();

// CRUD
// create brand
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("brand"), // form - data // req.body
  isValid(createbrandSchema),
  createBrand
);

// update brand
router.patch(
  "/:brandId",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("brand"),
  isValid(updatebrandSchema),
  updateBrand
);

// delete brand
router.delete(
  "/:brandId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(deletebrandSchema),
  deleteBrand
);

// get brands
router.get("/", allBrands);

export default router;
