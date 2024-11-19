const subscriptionModel = require("../models/subscriptionModel");
const jwt = require("jsonwebtoken");

exports.createSubscription = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    const userId = decoded.userId;

    // Check if user already has a subscription
    const existingSubscription = await subscriptionModel.getSubscriptionByUserId(userId);
    if (existingSubscription) {
      return res.status(400).json({ message: "User already has an active subscription" });
    }

    const subscription = await subscriptionModel.createSubscription(
      userId,
      planId,
      new Date(),
      'active'
    );

    res.status(201).json({
      message: "Subscription created successfully",
      subscription
    });
  } catch (err) {
    next(err);
  }
};

exports.getSubscription = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    const subscription = await subscriptionModel.getSubscriptionByUserId(decoded.userId);

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    res.json({ subscription });
  } catch (err) {
    next(err);
  }
};
