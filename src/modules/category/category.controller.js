import { Category } from "../../../DB/models/category.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import slugify from "slugify";
import cloudnairy from "./../../../src/utils/cloud.js";
import { Subcategory } from "./../../../DB/models/subcategory.model.js";

// create category
export const createCatgeory = asyncHandler(async (req, res, next) => {
  // file
  if (!req.file) return next(new Error("Category image is required!"));
  const { secure_url, public_id } = await cloudnairy.uploader.upload(
    req.file.path,
    { folder: `${process.env.FOLDER_CLOUD_NAME}/category` }
  );

  // save category in db
  const category = await Category.create({
    name: req.body.name,
    createdBy: req.user._id,
    image: { id: public_id, url: secure_url },
    slug: slugify(req.body.name),
  });

  // send response
  return res.status(201).json({ success: true, results: category });
});

// update category
export const updateCategory = asyncHandler(async (req, res, next) => {
  // check category
  const category = await Category.findById(req.params.categoryId);
  if (!category) return next(new Error("category not found!"));

  // check owner
  if (req.user._id.toString() !== category.createdBy.toString())
    return next(new Error("You not authorized!"));

  // name
  category.name = req.body.name ? req.body.name : category.name;

  // slug
  category.slug = req.body.name ? slugify(req.body.name) : category.slug;

  // files
  if (req.file) {
    const { public_id, secure_url } = await cloudnairy.uploader.upload(
      req.file.path,
      {
        public_id: category.image.id,
      }
    );
    category.image.url = secure_url;
  }

  // save category

  await category.save();

  return res.json({ success: true });
});

// delete category
export const deleteCategory = asyncHandler(async (req, res, next) => {
  // check category
  const category = await Category.findById(req.params.categoryId);
  if (!category) return next(new Error("invalid category id!"));

  // check owner
  if (req.user._id.toString() !== category.createdBy.toString())
    return next(new Error("You not authorized!"));

  // delete image
  const result = await cloudnairy.uploader.destroy(category.image.id);
  console.log(result);
  // if (result.result == 'ok')

  // delete category
  // await category.remove();
  await Category.findByIdAndDelete(req.params.categoryId);

  // delete subcategories
  await Subcategory.deleteMany({ categoryId: req.params.categoryId });

  return res.json({ success: true, message: "category deleted!" });
});

// get all categories
export const allCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().populate({
    path: "subcategory",
    populate: [{ path: "createdBy" }],
  }); // nested populate
  console.log(categories);
  return res.json({ success: true, results: categories });
});
