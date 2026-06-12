import "dotenv/config";
import OpenAI from "openai";
import { AiResponseError } from "./aiErrors.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCustomerFeedback(payload) {
  const prompt = `
You are generating a concise bilingual body-composition report summary for a health screening PDF.

Use only the JSON data provided. Do not invent missing values. Do not diagnose disease or make clinical claims.

Important missing-data rule:
- If a value is missing, null, empty, or unavailable, ignore it completely.
- Do not mention that a metric is missing.
- Do not say trend assessment is limited because a metric is missing.
- Only comment on metrics that exist in the current exam or previous_exams.
- Mention a trend only when at least two valid values exist for that metric.

The payload fields are:
- height_cm, weight_kg, age, sex: basic demographics
- bmi, body_data fields: hash-formatted as value#flag#reference_range (e.g. "22.5#normal#18.5-24.9")
- spo2: numeric SpO2 percentage
- temperature_c: body temperature in Celsius
- blood: object with low (diastolic), high (systolic), rate (pulse) — each hash-formatted
- body_data: object of body-composition metrics, each hash-formatted
- user_goals: array of the user's selected goals
- previous_exams: array of older exams for the same person (same structure), ordered oldest to newest

Use previous_exams to identify supported trends. Compare the current exam against previous exams for available metrics such as weight, BMI, body fat, muscle, water, body age, SpO2, blood pressure, and resting heart rate.

If user_goals is present:
- Prioritize findings relevant to those goals.
- Align recommendations with those goals.
- Do not mention goals that are not present.
- If goal-related metrics are missing, focus only on available related metrics.

Known goal meanings:
- weight_loss: reduce body fat and improve weight trend
- muscle_gain: increase or preserve muscle mass
- body_recomposition: reduce fat while preserving or increasing muscle
- cardiovascular_health: support blood pressure, oxygen saturation, resting heart rate, and visceral fat health
- general_wellness: improve overall score, body age, and general body composition
- recovery_monitoring: support hydration, muscle recovery, SpO2, and resting heart rate

Tone:
- Calm, practical, and easy for a non-clinical reader.
- Avoid alarmist language.
- Use "consider discussing with a qualified professional" / "يُفضّل مناقشة ذلك مع مختص مؤهل" for concerning patterns.
- Arabic should be natural Modern Standard Arabic, not a literal translation.

Patient exam JSON data:
${JSON.stringify(payload, null, 2)}

Return valid JSON only. No markdown, no code fences, no extra text.

Required JSON schema:
{
  "en": {
    "summary": "2-3 short sentences summarizing the current result and important supported trends.",
    "recommendations": "2-4 practical lifestyle recommendations aligned with available data, goals, and trends.",
    "strengths": ["2-4 positive findings based only on available data"],
    "weaknesses": ["1-4 areas to watch or improve based only on available data"]
  },
  "ar": {
    "summary": "ملخص عربي من 2-3 جمل قصيرة عن النتيجة الحالية والاتجاهات المثبتة بالبيانات المتاحة فقط.",
    "recommendations": "توصيات عملية من 2-4 نقاط بناءً على البيانات المتاحة والأهداف والاتجاهات.",
    "strengths": ["2-4 نقاط إيجابية بناءً على البيانات المتاحة فقط"],
    "weaknesses": ["1-4 نقاط تحتاج انتباه أو تحسين بناءً على البيانات المتاحة فقط"]
  }
}
`;

  const response = await client.responses.create({
    model: "gpt-5.4-mini",
    input: prompt,
  });

  let parsed;
  try {
    parsed = JSON.parse(response.output_text);
  } catch {
    console.error("[aiService] Failed to parse AI JSON response:", response.output_text);
    throw new AiResponseError("AI returned non-JSON response");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !parsed.en?.summary ||
    !parsed.ar?.summary
  ) {
    console.error("[aiService] AI returned unexpected shape:", response.output_text);
    throw new AiResponseError("AI response missing required fields");
  }

  return parsed;
}
