import { asyncHandler } from "../../utils/asyncHandler.js";
import { Coupon } from "./../../../DB/models/coupon.model.js";
import { Cart } from "./../../../DB/models/cart.model.js";
import { Product } from "./../../../DB/models/product.model.js";
import { Order } from "../../../DB/models/order.model.js";
import cloudinary from "./../../utils/cloud.js";
import { clearCart, updateStock } from "./order.service.js";
import { fileURLToPath } from "url";
import { sendEmail } from "./../../utils/sendEmails.js";
import { createInvoice } from "./../../utils/pdfTemp.js";
import path from "path";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// create order
export const createOrder = asyncHandler(async (req, res, next) => {
  // data
  const { payment, address, coupon, phone } = req.body;
  // check coupon
  let checkCoupon;
  if (coupon) {
    checkCoupon = await Coupon.findOne({
      name: coupon,
      expiredAt: { $gt: Date.now() },
    });

    if (!checkCoupon) return next(new Error("Invalid coupon!"));
  }
  // get products from cart
  const cart = await Cart.findOne({ user: req.user._id });
  const products = cart.products;
  if (products.length < 1) return next(new Error("Empty cart!"));
  // check product
  let orderProducts = []; //[{},{},{}]
  let orderPrice = 0; // 5898

  for (let i = 0; i < products.length; i++) {
    const product = await Product.findById(products[i].productId);
    if (!product)
      return next(new Error(`${products[i].productId} product not found!`));

    if (!product.inStock(products[i].quantity))
      return next(
        new Error(`${product.name} only ${product.availableItems} are left!`)
      );

    orderProducts.push({
      name: product.name,
      quantity: products[i].quantity,
      itemPrice: product.finalPrice,
      totalPrice: product.finalPrice * products[i].quantity,
      productId: product._id,
    });

    orderPrice += product.finalPrice * products[i].quantity;
  }

  // create order in DB
  const order = await Order.create({
    user: req.user._id,
    address,
    payment,
    phone,
    coupon: {
      id: checkCoupon?._id,
      name: checkCoupon?.name,
      discount: checkCoupon?.discount,
    },
    products: orderProducts,
    price: orderPrice,
  });

  if (!order) return next(new Error("Failed to create order!"));

  // create invoice
  const user = req.user;
  const invoice = {
    shipping: {
      name: user.userName,
      address: order.address,
      country: "Egypt",
    },
    items: order.products,
    subtotal: order.price,
    paid: order.finalPrice,
    invoice_nr: order._id,
  };

  const pdfPath = path.join(
    __dirname,
    `./../../../tempInvoices/${order._id}.pdf`
  );
  createInvoice(invoice, pdfPath);

  // upload invoice cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(pdfPath, {
    folder: `${process.env.FOLDER_CLOUD_NAME}/order/invoices`,
  });

  // update order
  order.invoice = { url: secure_url, id: public_id };
  await order.save();
  ///////////////////////done///////////////////////////////

  // send email to user
  const isSent = await sendEmail({
    to: user.email,
    subject: "Order Invoice",
    attachments: [
      {
        // utf-8 string as an attachment
        path: secure_url,
        contentType: "application/pdf",
      },
    ],
  });

  console.log("isSent:", isSent);

  // update stock >>>> discuss
  updateStock(order.products, true);

  // clear cart
  clearCart(req.user._id);

  // stripe payment
  if (payment === "visa") {
    const stripe = new Stripe(process.env.STRIPE_KEY);

    // coupon
    let couponExist;
    if (order.coupon.name !== undefined) {
      couponExist = await stripe.coupons.create({
        percent_off: order.coupon.discount,
        duration: "once",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.SUCCESS_URL}`,
      cancel_url: `${process.env.CANCEL_URL}`,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: {
              name: product.name,
              // images: [product.productId.defaultImage.url]
            },
            unit_amount: product.itemPrice * 100, // cents dolla
          },
          quantity: product.quantity,
        };
      }),
      discounts: couponExist ? [{ coupon: couponExist.id }] : [],
    });
    // response
    return res.status(201).json({
      success: true,
      results: session.url,
      message: "Thanks for order, check your email!",
    });
  }

  // response
  return res.status(201).json({
    success: true,
    message: "Thanks for order, check your email!",
  });
});

// cancel order
export const cancelOrder = asyncHandler(async (req, res, next) => {
  // check order
  const order = await Order.findById(req.params.orderId);
  if (!order) return next(new Error("oder not found!"));
  // update status
  if (order.status === "delivered" || order.status === "shipped")
    return next(new Error("Can not cancel order"));

  order.status = "canceled";
  await order.save();

  // update stock
  updateStock(order.products, false);

  // response
  return res.json({ success: true, message: "Order canceled!" });
});
