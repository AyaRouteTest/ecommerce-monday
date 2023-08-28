import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "./../../utils/cloud.js";
import { nanoid } from "nanoid";
import { Product } from "./../../../DB/models/product.model.js";

// create product
export const addProduct = asyncHandler(async (req, res, next) => {
  // data
  //   const {
  //     name,
  //     description,
  //     price,
  //     discount,
  //     avaliableItems,
  //     category,
  //     subcategory,
  //     brand,
  //   } = req.body;

  // files
  if (!req.files)
    return next(new Error("product images are required!", { cause: 400 }));

  // create unique folder name
  const cloudFolder = nanoid();
  let images = [];
  // upload sub files
  for (const file of req.files.subImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: `${process.env.FOLDER_CLOUD_NAME}/products/${cloudFolder}` }
    );
    images.push({ id: public_id, url: secure_url });
  }

  // upload default image
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.defaultImage[0].path,
    { folder: `${process.env.FOLDER_CLOUD_NAME}/products/${cloudFolder}` }
  );

  console.log(images);

  //  create product
  const product = await Product.create({
    ...req.body,
    cloudFolder,
    createdBy: req.user._id,
    defaultImage: { url: secure_url, id: public_id },
    images, // [{id: , url: }, {id: , url: }, {id: , url: }]
  });

  // console.log("product2 without discount: ", product.finalPrice);

  // send response
  return res.status(201).json({ success: true, results: product });
});

// delete product
export const deleteProduct = asyncHandler(async (req, res, next) => {
  // check product
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new Error("Product not found!"));
  // check owner
  if (req.user._id.toString() != product.createdBy.toString())
    return next(new Error("Not authorized", { cause: 401 }));

  const imagesArr = product.images; //[{id: , url: }, {id: , url: }]
  const ids = imagesArr.map((imageObj) => imageObj.id);
  console.log(ids);
  ids.push(product.defaultImage.id); // add id of default image

  // delete images
  const result = await cloudinary.api.delete_resources(ids);

  // delete folder >>> empty
  await cloudinary.api.delete_folder(
    `${process.env.FOLDER_CLOUD_NAME}/products/${product.cloudFolder}`
  );

  // delete product from DB
  await Product.findByIdAndDelete(req.params.productId);

  // send response
  return res.json({ success: true, message: "product deleted successfully!" });
});

// all products
export const allProducts = asyncHandler(async (req, res, next) => {
  console.log(req.params.categoryId);
  if (req.params.categoryId) {
    const products = await Product.find({ category: req.params.categoryId });
    return res.json({ success: true, results: products });
  }
  const query = Product.find({ ...req.query })
    .sort(req.query.sort)
    .paginate(req.query.page)
    .customSelect(req.query.fields);

  // execute query
  const products = await query;

  return res.json({ success: true, results: products });
});

// single product
export const singleProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new Error("Product not found!", { cause: 404 }));
  return res.json({ success: true, results: product });
});
