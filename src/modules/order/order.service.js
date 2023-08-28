import { Cart } from "../../../DB/models/cart.model.js";
import { Product } from "./../../../DB/models/product.model.js";

// update stock
export const updateStock = async (products, createOrder) => {
  // create order >>> Boolean
  // true >>> create order
  // false >> cancel order
  if (createOrder) {
    for (const product of products) {
      await Product.findByIdAndUpdate(product.productId, {
        $inc: {
          soldItems: product.quantity,
          availableItems: -Number(product.quantity),
        },
      });
    }
  } else {
    for (const product of products) {
      await Product.findByIdAndUpdate(product.productId, {
        $inc: {
          soldItems: -product.quantity,
          avaiableItems: product.quantity,
        },
      });
    }
  }
};

export const clearCart = async (userId) => {
  await Cart.findOneAndUpdate({ user: userId }, { products: [] });
};
