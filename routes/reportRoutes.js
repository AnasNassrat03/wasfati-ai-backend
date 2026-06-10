import express from "express";
import { APIError, AuthenticationError, RateLimitError, APIConnectionError, APIConnectionTimeoutError } from "openai";
import { generateCustomerFeedback } from "../services/aiService.js";

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
    if (error instanceof AuthenticationError) {
      console.error("[route] OpenAI authentication failed — check OPENAI_API_KEY");
      return res.status(502).json({ error: "AI service authentication failed." });
    }

    if (error instanceof RateLimitError) {
      const code = error.error?.code ?? error.code;
      const isQuota = code === "insufficient_quota" || code === "billing_hard_limit_reached";
      console.error(`[route] OpenAI rate limit hit (${isQuota ? "no credits" : "rate limited"})`);
      return res.status(429).json({ error: isQuota ? "AI service quota exceeded." : "AI service rate limit reached." });
    }

    if (error instanceof APIConnectionError || error instanceof APIConnectionTimeoutError) {
      console.error("[route] OpenAI connection/timeout error:", error.message);
      return res.status(503).json({ error: "AI service unreachable." });
    }

    if (error instanceof APIError) {
      console.error(`[route] OpenAI API error (${error.status}):`, error.message);
      return res.status(502).json({ error: "AI service error." });
    }

    // Malformed or missing fields in the AI response
    if (error.message?.includes("non-JSON") || error.message?.includes("missing required fields")) {
      console.error("[route] Bad AI response:", error.message);
      return res.status(502).json({ error: "AI returned an unusable response." });
    }

    console.error("[route] Unexpected error:", error);
    return res.status(500).json({ error: "Failed to generate summary." });
  }
});

export default router;
