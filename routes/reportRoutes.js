import express from "express";
import { generateCustomerFeedback } from "../services/aiService.js";

const router = express.Router();

router.post("/webhook", async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid JSON body.",
      });
    }

    const feedback = await generateCustomerFeedback(payload);

    return res.json(feedback);
  } catch (error) {
    console.error("Webhook processing error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process report.",
    });
  }
});

export default router;
