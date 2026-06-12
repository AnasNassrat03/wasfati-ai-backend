import express from "express";
import { generateCustomerFeedback } from "../services/aiService.js";
import { classifyAiError } from "../services/aiErrors.js";

const router = express.Router();

router.post("/webhook", async (req, res) => {
  const payload = req.body;

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return res.status(400).json({ error: "Missing or invalid JSON body." });
  }

  try {
    const feedback = await generateCustomerFeedback(payload);
    return res.json(feedback);
  } catch (error) {
    const { reason, status, message } = classifyAiError(error);
    console.error(`[route] Summary generation failed (${reason}):`, error.message ?? error);
    return res.status(status).json({ error: message });
  }
});

export default router;
