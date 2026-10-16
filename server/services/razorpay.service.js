import dotenv from "dotenv"
dotenv.config()
import Razorpay from "razorpay"


console.log(
  "Razorpay Key ID loaded:",
  process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_")
);

console.log(
  "Razorpay Secret loaded:",
  Boolean(process.env.RAZORPAY_KEY_SECRET)
);

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpay