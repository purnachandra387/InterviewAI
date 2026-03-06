const Stripe = require("stripe");
const User = require("../models/User");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_demo");

// ─────────────────────────────────────────────
// @route   POST /api/stripe/create-checkout-session
// @desc    Create a Stripe checkout session URL
// @access  Private
// ─────────────────────────────────────────────
const createCheckoutSession = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const userEmail = req.user.email;

        // Note: For a real app, you would create a Product in Stripe 
        // and paste its "Price ID" here (e.g., price_1Nxyz...).
        // Since we are building the framework, we'll create a price dynamically.

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription", // Use 'payment' for one-time
            customer_email: userEmail,
            client_reference_id: userId,
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: "AI Interview SaaS - Premium Plan",
                            description: "Unlimited Mock Interviews, Resume Analysis, and AI questions.",
                        },
                        unit_amount: 9900, // ₹99.00 (in paise)
                        recurring: { interval: "month" }
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/dashboard?payment=success`,
            cancel_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/pricing?payment=cancelled`,
        });

        res.status(200).json({ url: session.url });
    } catch (err) {
        console.error("Stripe Checkout Error:", err);
        // Fallback for demo mode if no real Stripe keys are set
        if (err.message.includes("Invalid API Key provided")) {
            return res.status(200).json({
                url: `${process.env.CLIENT_URL || "http://localhost:3000"}/dashboard?payment=demo_success`
            });
        }
        res.status(500).json({ message: "Failed to create checkout session" });
    }
};

// ─────────────────────────────────────────────
// @route   POST /api/stripe/webhook
// @desc    Stripe webhook listener (upgrades user)
// @access  Public (Called by Stripe)
// ─────────────────────────────────────────────
const webhook = async (req, res) => {
    const payload = req.body;
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (endpointSecret) {
            // Verify it actually came from Stripe
            event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        } else {
            // Unverified parsing (for local demo tests only)
            event = JSON.parse(payload.toString());
        }
    } catch (err) {
        console.error("Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.client_reference_id;

        if (userId) {
            console.log(`✅ Upgrading user ${userId} to Premium!`);
            await User.findByIdAndUpdate(userId, { isPremium: true });
        }
    }

    res.status(200).json({ received: true });
};

// ─────────────────────────────────────────────
// @route   POST /api/stripe/demo-upgrade
// @desc    Instant upgrade for local testing (bypasses Stripe)
// @access  Private
// ─────────────────────────────────────────────
const demoUpgrade = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { isPremium: true });
        res.status(200).json({ message: "Account upgraded successfully in Demo Mode!" });
    } catch (err) {
        res.status(500).json({ message: "Upgrade failed" });
    }
}

module.exports = { createCheckoutSession, webhook, demoUpgrade };
