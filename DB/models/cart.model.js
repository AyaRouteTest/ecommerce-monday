import mongoose, { Schema, model, Types } from "mongoose";

const cartSchema = new Schema(
  {
    products: [
      {
        _id: false,
        productId: { type: Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],
    user: { type: Types.ObjectId, ref: "User", required: true, unique: true },
  },
  { timestamps: true }
);

export const Cart = mongoose.models.Cart || model("Cart", cartSchema);
