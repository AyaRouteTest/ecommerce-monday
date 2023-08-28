import { asyncHandler } from "../../utils/asyncHandler.js";
import voucher_codes from "voucher-code-generator";
import { Coupon } from "./../../../DB/models/coupon.model.js";

// create coupon
export const createCoupon = asyncHandler(async (req, res, next) => {
  // generate code
  const code = voucher_codes.generate({ length: 5 }); //['hbhb']
  // create coupon in DB
  const coupon = await Coupon.create({
    name: code[0],
    createdBy: req.user._id,
    discount: req.body.discount,
    expiredAt: new Date(req.body.expiredAt).getTime(), //12/6/2023 // MM/DD/YY
  });

  return res.json({ success: true, results: coupon });
});

// update coupon
export const updateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findOne({
    name: req.params.code,
    expiredAt: { $gt: Date.now() },
  });
  // check coupon
  if (!coupon) return next(new Error("Coupon not found!", { cause: 404 }));

  // check owner
  if (req.user._id.toString() != coupon.createdBy.toString())
    return next(new Error("Not authorized!"));

  coupon.discount = req.body.discount ? req.body.discount : coupon.discount;
  coupon.expiredAt = req.body.expiredAt
    ? new Date(req.body.expiredAt).getTime()
    : coupon.expiredAt;

  await coupon.save();

  return res.json({
    success: true,
    message: "Coupon updated Successfully!",
    results: coupon,
  });
});

// all coupons
export const allCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find({});
  return res.json({ success: true, results: coupons });
});

// delete coupon
export const deleteCoupon = asyncHandler(async (req, res, next) => {
  // const coupon = await Coupon.findOneAndDelete({
  //   name: req.params.code,
  //   createdBy: req.user._id,
  // });
  // console.log(coupon);
  // if (!coupon) return next(new Error("Coupon not found!"));

  const coupon = await Coupon.findOne({ name: req.params.code });
  if (!coupon) return next(new Error("Invalid code name!"));

  if (coupon.createdBy.toString() !== req.user.id)
    return next(new Error("You not the owner!"));

  // id > string, _id > objectId

  return res.json({ success: true, message: "coupon deleted successfully!" });
});
