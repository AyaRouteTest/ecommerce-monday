import mongoose, { Schema, Types, model } from "mongoose";

// schema
const productSchema = new Schema(
  {
    name: { type: String, required: true, min: 2, max: 20 },
    description: String,
    images: [
      {
        id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    defaultImage: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    availableItems: { type: Number, min: 1, required: true },
    soldItems: { type: Number, default: 0 },
    price: { type: Number, min: 1, required: true },
    discount: { type: Number, min: 1, max: 100 }, // %%%   20 >>> 20%
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    category: { type: Types.ObjectId, ref: "Categotry" },
    subcategory: { type: Types.ObjectId, ref: "Subcategotry" },
    brand: { type: Types.ObjectId, ref: "Brand" },
    cloudFolder: { type: String, unique: true },
  },
  { timestamps: true, strictQuery: true, toJSON: { virtuals: true } }
);

// virtual
productSchema.virtual("finalPrice").get(function () {
  // this >>>> document >>> product {}

  // calculate final price ?! "price" "discount"     700 LE
  // if (this.discount > 0) {
  //   return this.price - (this.price * this.discount) / 100;
  // }
  // return this.price;

  if (this.price) {
    return Number.parseFloat(
      this.price - (this.price * this.discount || 0) / 100
    ).toFixed(2);
  }
});

// methods save remove .... doc.save()
productSchema.methods.inStock = function (requiredQuantity) {
  return this.availableItems >= requiredQuantity ? true : false;
};

// query helpers
productSchema.query.paginate = function (page) {
  // page < 1, 'Hi', page x
  page = page < 1 || isNaN(page) || !page ? 1 : page;
  const limit = 2;
  const skip = limit * (page - 1);

  // this >> query
  return this.skip(skip).limit(limit); // return query
};

productSchema.query.customSelect = function (fields) {
  // this >>> query
  if (fields) {
    // model fields model keys
    const modelKeys = Object.keys(Product.schema.paths).map((key) =>
      key.toLowerCase()
    );
    console.log("modelKeys: ", modelKeys);
    //['name', 'description', 'defaultimage', ...............]

    // query field keys
    const queryKeys = fields.toLowerCase().split(" ");
    console.log("queryKeys:", queryKeys);

    // compare
    let commonKeys = queryKeys.filter((key) => modelKeys.includes(key));
    console.log("commonKeys:", commonKeys);

    if (commonKeys.length < 1) {
      commonKeys = {};
    }
    return this.select(commonKeys);
  }
};
// model
export const Product =
  mongoose.models.Product || model("Product", productSchema);
