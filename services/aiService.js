import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCustomerFeedback(parsedReport) {
  const prompt = `
You are an assistant for Wasfati, a body scan tracking service in Libya.

You will receive structured InBody / M-Body scan data.

Your task:
- Analyze the scan data.
- Identify two positive things the customer is doing well according to the data.
- Identify one thing the customer can improve.
- Use simple Arabic.
- Be friendly and encouraging.
- Do not diagnose diseases.
- Do not give medical claims.
- Do not mention anything as dangerous or abnormal.
- Focus on fitness, consistency, hydration, muscle, fat percentage, and progress tracking.
- Mention that the scan is for awareness and tracking, not medical diagnosis.
- Make it suitable to send to the customer by WhatsApp.

Customer and scan data:
${JSON.stringify(parsedReport, null, 2)}

Return ONLY valid JSON in this exact structure:

{
  "positives": [
    {
      "title": "string",
      "message": "string"
    },
    {
      "title": "string",
      "message": "string"
    }
  ],
  "improvement": {
    "title": "string",
    "message": "string"
  },
  "important_note": "string"
}
`;

  const response = await client.responses.create({
    model: "gpt-5.2",
    input: prompt,
  });

  return JSON.parse(response.output_text);
}