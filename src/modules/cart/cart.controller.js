import { Cart } from "../../../DB/models/cart.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Product } from "./../../../DB/models/product.model.js";

// add to cart
export const addToCart = asyncHandler(async (req, res, next) => {
  // data
  const { productId, quantity } = req.body;

  // check product
  const product = await Product.findById(productId);
  if (!product) return next(new Error("product not found!", { cause: 404 }));

  // check stock
  // if (quantity > product.availableItems)
  //   return next(
  //     new Error(`Sorry, only ${product.availableItems} items are avaiable`)
  //   );

  if (!product.inStock(quantity))
    return next(
      new Error(`Sorry, only ${product.availableItems} items are avaiable`)
    );

  // add product to cart
  //   const cart = await Cart.findOne({ user: req.user._id });
  //   cart.products.push({ productId, quantity });
  //   await cart.save();

  // check product existence in the cart
  const isProductInCart = await Cart.findOne({
    user: req.user._id,
    "products.productId": productId,
  });

  if (isProductInCart) {
    isProductInCart.products.forEach((productObj) => {
      if (productObj.productId.toString() === productId.toString()) {
        if (productObj.quantity + quantity < product.availableItems) {
          productObj.quantity = productObj.quantity + quantity;
        }
      }
    });
    await isProductInCart.save();
    // response
    return res.json({
      success: true,
      results: isProductInCart,
      message: "product added successfully!",
    });
  }

  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $push: { products: { productId, quantity } } },
    { new: true }
  );

  // send response
  return res.json({
    success: true,
    results: cart,
    message: "product added successfully!",
  });
});

// user cart
export const userCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "products.productId",
    select: "price discount finalPrice -_id",
  }); // to search
  return res.json({ success: true, results: cart });
});

// update cart
export const updateCart = asyncHandler(async (req, res, next) => {
  // data
  const { productId, quantity } = req.body;

  // check product
  const product = await Product.findById(productId);
  if (!product) return next(new Error("product not found!", { cause: 404 }));

  // check stock
  if (quantity > product.availableItems)
    return next(
      new Error(`Sorry, only ${product.availableItems} items are avaiable`)
    );

  // update cart
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id, "products.productId": productId },
    { $set: { "products.$.quantity": quantity } },
    { new: true }
  );
  // response
  return res.json({ success: true, results: cart });
});

// remove from cart
export const removeFromCart = asyncHandler(async (req, res, next) => {
  // data
  const { productId } = req.params;

  // check product
  const product = await Product.findById(productId);
  if (!product) return next(new Error("product not found!", { cause: 404 }));

  // remove product
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { products: { productId } } },
    { new: true }
  );

  // response
  return res.json({
    success: true,
    results: cart,
    message: "product removed successfully!",
  });
});

// clear cart
export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { products: [] },
    { new: true }
  );

  return res.json({ success: true, results: cart });
});
