# Wasfati AI Backend

A lightweight Express service that receives structured exam data from the **health** ingest service and uses OpenAI to produce a concise **bilingual (English + Arabic)** AI summary for the PDF report.

## How it works

```
health service  ──▶  POST /api/reports/webhook  ──▶  aiService.js  ──▶  { en, ar } JSON
(structured JSON)                                      (OpenAI)          saved to exams.summary
```

1. The health service POSTs structured exam data after each scan is ingested.
2. [`services/aiService.js`](services/aiService.js) sends the payload to OpenAI and returns a structured bilingual summary (summary, recommendations, strengths, weaknesses) in both English and Arabic.
3. The health service saves the response to the `summary` column on the `exams` table. The PDF picks it up when the report is generated.

If the AI call fails for any reason (no credits, timeout, bad response, etc.) the endpoint returns a non-2xx status, health skips saving the summary, and the PDF renders without a summary section.

## Project structure

```
.
├── server.js                  # Express app entry point
├── routes/
│   └── reportRoutes.js        # POST /api/reports/webhook
├── services/
│   └── aiService.js           # OpenAI bilingual feedback generation
└── package.json
```

## Requirements

- Node.js (ES modules — `"type": "module"`)
- An OpenAI API key

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create a .env file (see below)
# 3. Run
npm run dev      # development, with nodemon auto-reload
npm start        # production
```

### Environment variables

```env
OPENAI_API_KEY=sk-your-key-here
PORT=5000
```

`PORT` is optional and defaults to `5000`.

## API

### `GET /`

Health check.

```json
{ "success": true, "message": "Wasfati AI backend is running" }
```

### `POST /api/reports/webhook`

Accepts structured exam data and returns a bilingual AI summary.

**Request body** (sent by the health service — fields from `cleanRow()` plus goals and history)

```json
{
  "height_cm": 175,
  "weight_kg": 80.5,
  "bmi": "22.5#normal#18.5-24.9",
  "spo2": 98,
  "temperature_c": 36.5,
  "blood": {
    "low": "70#normal#60-90",
    "high": "120#normal#100-140",
    "rate": "72#normal#60-100"
  },
  "sex": "male",
  "age": 35,
  "body_data": {
    "body_fat_rate": "18.0#normal#10-20",
    "body_muscle_rate": "40.1#normal#35-50"
  },
  "user_goals": ["weight_loss"],
  "previous_exams": []
}
```

Hash-formatted fields follow the pattern `value#flag#reference_range`.

**Response (200)**

```json
{
  "en": {
    "summary": "...",
    "recommendations": "...",
    "strengths": ["..."],
    "weaknesses": ["..."]
  },
  "ar": {
    "summary": "...",
    "recommendations": "...",
    "strengths": ["..."],
    "weaknesses": ["..."]
  }
}
```

**Error responses**

| Status | Reason |
|--------|--------|
| `400` | Missing or invalid request body |
| `429` | OpenAI quota exceeded or rate limited |
| `502` | OpenAI authentication failed, or AI returned an unusable response |
| `503` | OpenAI unreachable or timed out |
| `500` | Unexpected server error |

On any error the health service skips saving the summary and the PDF renders without a summary section.

## Notes

- The AI output is intended for **awareness and progress tracking only — not medical diagnosis**.
- Missing metrics are silently ignored — partial payloads still produce useful summaries.
- Trends are only mentioned when at least two valid values exist across `previous_exams`.

## Scripts

| Script        | Description                        |
| ------------- | ---------------------------------- |
| `npm run dev` | Start with `nodemon` (auto-reload) |
| `npm start`   | Start the server                   |
