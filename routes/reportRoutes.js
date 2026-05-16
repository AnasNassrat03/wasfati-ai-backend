import express from "express";
import { parseInBodyReport } from "../utils/reportParser.js";
import { generateCustomerFeedback } from "../services/aiService.js";

const router = express.Router();

router.post("/webhook", async (req, res) => {
  try {
    const { reportText } = req.body;

    if (!reportText) {
      return res.status(400).json({
        success: false,
        message: "Missing reportText in request body.",
      });
    }

    const parsedReport = parseInBodyReport(reportText);

    const aiFeedback = await generateCustomerFeedback(parsedReport);

    return res.json({
      success: true,
      customer: parsedReport.customer,
      scan: parsedReport.scan,
      metrics: parsedReport.metrics,
      feedback: aiFeedback,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process report.",
    });
  }
});

export default router;