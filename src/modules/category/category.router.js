import { Router } from "express";
import { isValid } from "./../../middleware/validation.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} from "./category.validation.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import subcategoryRouter from "./../subcategory/subcategory.router.js";
import productRouter from "./../product/product.router.js";

import {
  createCatgeory,
  updateCategory,
  deleteCategory,
  allCategories,
} from "./category.controller.js";
const router = Router();

router.use("/:categoryId/subcategory", subcategoryRouter);
router.use("/:categoryId/products", productRouter);

// CRUD
// create category
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("category"), // form - data // req.body
  isValid(createCategorySchema),
  createCatgeory
);

// update category
router.patch(
  "/:categoryId",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("category"),
  isValid(updateCategorySchema),
  updateCategory
);

// delete category
router.delete(
  "/:categoryId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(deleteCategorySchema),
  deleteCategory
);

// get categories
router.get("/", allCategories);

export default router;
