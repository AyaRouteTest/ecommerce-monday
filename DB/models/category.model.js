import mongoose, { Schema, Types, model } from "mongoose";

// schema
const categorySchema = new Schema(
  {
    name: { type: String, required: true, min: 4, max: 15 },
    slug: { type: String, required: true },
    image: {
      url: { type: String, required: true },
      id: { type: String, required: true },
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    brandId: { type: Types.ObjectId, ref: "Brand" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.virtual("subcategory", {
  ref: "Subcategory",
  localField: "_id", // category model
  foreignField: "categoryId", // subcategory model
});

// model
export const Category =
  mongoose.models.Category || model("Category", categorySchema);
