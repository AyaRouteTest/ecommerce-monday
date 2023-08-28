import mongoose, { model, Schema, Types } from "mongoose";

const couponSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    expiredAt: Number,
    discount: { type: Number, min: 1, max: 100, required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Coupon = mongoose.models.Coupon || model("Coupon", couponSchema);
