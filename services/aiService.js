import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCustomerFeedback(parsedReport) {
  const prompt = `
You are an assistant for Wasfati, a body scan tracking service in Libya.

You will receive structured InBody / M-Body scan data.

Your task:
- Give friendly feedback to the customer.
- Use simple language.
- Do not diagnose diseases.
- Do not give medical claims.
- Focus on fitness, consistency, hydration, muscle, fat percentage, and progress tracking.
- Mention that the scan is for awareness and tracking, not medical diagnosis.
- Write the answer in Arabic.
- Make it suitable to send to the customer by WhatsApp.
- Keep it clear and encouraging.

Customer and scan data:
${JSON.stringify(parsedReport, null, 2)}

Return the answer in this structure:

1. ملخص سريع
2. أهم الملاحظات
3. نصائح بسيطة
4. ملاحظة مهمة
`;

  const response = await client.responses.create({
    model: "gpt-5.2",
    input: prompt,
  });

  return response.output_text;
}