import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import razorpay from "../services/razorpay.service.js";
import crypto from "crypto";

export const createOrder = async (req, res) => {
  try {
    const { planId, amount, credits } = req.body;

    if (!planId || !Number.isFinite(amount) ||
        amount <= 0 || !Number.isInteger(credits) ||
        credits <= 0) {
      return res.status(400).json({ message: "Invalid plan data" });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const savedPayment = await Payment.create({
      userId: req.userId,
      planId,
      amount,
      credits,
      razorpayOrder: order.id,
      status: "created",
    });

    console.log("Payment saved in MongoDB:", savedPayment.razorpayOrder);

    return res.json(order);
 } catch (error) {
  console.error("Razorpay order error:", error);

  return res.status(500).json({
    message: "Failed to create Razorpay order",
    error: error.message,
  });
}
};

export const verifyPayment = async (req, res) => {
  try {
    console.log("VERIFY ROUTE HIT");
    console.log("Verify body:", req.body);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id ||
        !razorpay_signature) {
      return res.status(400).json({
        message: "Missing payment details",
      });
    }

    console.log("Order ID received:", razorpay_order_id);

    const payment = await Payment.findOne({
      razorpayOrder: razorpay_order_id,
    });

    console.log("Payment record found:", Boolean(payment));

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    if (payment.status === "paid") {
      return res.json({ message: "Already processed" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const received = Buffer.from(razorpay_signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    
    // Update payment record
    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save();
    console.log("Payment marked as paid");

    // Add credits to user
    const updatedUser = await User.findByIdAndUpdate(
    payment.userId,
    { $inc: { credits: payment.credits } },
    { returnDocument: "after" }
  );

  console.log("Updated user credits:", updatedUser?.credits);

    return res.json({
      success: true,
      message: "Payment verified and credits added",
      user: updatedUser,
    });

  } catch (error) {
     console.error("Verify payment error:", error);
     
    return res.status(500).json({
      message: "Failed to verify Razorpay payment",
        error: error.message,
    });
  }
};