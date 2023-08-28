import mongoose, { Schema, Types, model } from "mongoose";

const orderSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    products: [
      {
        _id: false,
        productId: { type: Types.ObjectId, ref: "Product" },
        quantity: { type: Number, min: 1 },
        name: String,
        itemPrice: Number,
        totalPrice: Number,
      },
    ],
    invoice: { url: String, id: String },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    price: { type: Number, required: true },
    coupon: {
      id: { type: Types.ObjectId, ref: "Coupon" },
      name: String,
      discount: { type: Number, min: 1, max: 100 },
    },
    status: {
      type: String,
      default: "placed",
      enum: ["placed", "shipped", "delivered", "canceled", "refunded"],
    },
    payment: { type: String, default: "cash", enum: ["cash", "visa"] },
  },
  { timestamps: true }
);

orderSchema.virtual("finalPrice").get(function () {
  //this
  return this.coupon
    ? Number.parseFloat(
        this.price - (this.price * this.coupon.discount) / 100
      ).toFixed(2)
    : this.price;
});

export const Order = mongoose.models.Order || model("Order", orderSchema);
