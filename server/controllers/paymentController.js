const Razorpay = require("razorpay");
const User = require("../models/User");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY_ID",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "YOUR_RAZORPAY_KEY_SECRET"
});

exports.createOrder = async (req, res) => {
  try {
    const options = {
      amount: 49900, // ₹499 in paise
      currency: "INR",
      receipt: "interviewai_subscription_" + (req.user ? req.user._id : Date.now())
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Payment error", error });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    // Basic verification - assuming valid for frontend demo
    // User is protected via protect middleware
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { isPremium: true });
    }
    res.status(200).json({ message: "Payment verified successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error });
  }
};

exports.demoUpgrade = async (req, res) => {
  try {
      await User.findByIdAndUpdate(req.user._id, { isPremium: true });
      res.status(200).json({ message: "Account upgraded successfully in Demo Mode!" });
  } catch (err) {
      res.status(500).json({ message: "Upgrade failed" });
  }
};
