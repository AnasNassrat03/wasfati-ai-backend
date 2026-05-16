function extractText(pattern, text, fallback = null) {
    const match = text.match(pattern);
    return match ? match[1].trim() : fallback;
  }
  
  function extractNumber(pattern, text, fallback = null) {
    const match = text.match(pattern);
  
    if (!match) return fallback;
  
    const value = Number(String(match[1]).replace(",", "."));
  
    return Number.isNaN(value) ? fallback : value;
  }
  
  function getStatus(value, min, max) {
    if (value === null || value === undefined) return "unknown";
    if (min !== null && value < min) return "low";
    if (max !== null && value > max) return "high";
    return "normal";
  }
  
  export function parseInBodyReport(reportText) {
    const cleanText = reportText.replace(/\s+/g, " ").trim();
  
    const customer = {
      name: extractText(/الاسم\s+(.+?)\s+العمر/, cleanText),
      age: extractNumber(/العمر\s+(\d+)/, cleanText),
      gender: extractText(/الجنس\s+(.+?)\s+رقم/, cleanText),
      whatsapp: extractText(/رقم\s+\+?(\d+)/, cleanText),
    };
  
    const scan = {
      scanNumber: extractText(/رقم الفحص\s+(\d+)/, cleanText),
      scanDate: extractText(/تاريخ الفحص\s+([\d/]+)/, cleanText),
      deviceNumber: extractText(/رقم الجهاز\s+([A-Z0-9]+)/, cleanText),
    };
  
    const metrics = {
      heightCm: extractNumber(/الطول\s+([\d.]+)\s+سم/, cleanText),
      weightKg: extractNumber(/الوزن\s+([\d.]+)\s+كجم/, cleanText),
  
      bmi: extractNumber(/BMI\)\s+([\d.]+)/, cleanText),
  
      boneMass: extractNumber(/كتلة العظام\s+([\d.]+)/, cleanText),
      proteinContent: extractNumber(/محتوى البروتين\s+([\d.]+)/, cleanText),
      bodyMuscleContent: extractNumber(/محتوى العضلات في الجسم\s+([\d.]+)/, cleanText),
      bodyFatContent: extractNumber(/محتوى الدهون في الجسم\s+([\d.]+)/, cleanText),
      skeletalMuscleMass: extractNumber(/كتلة العضلات الهيكلية\s+([\d.]+)/, cleanText),
      basalMetabolism: extractNumber(/معدل الايض الأساسي\s+([\d.]+)/, cleanText),
      visceralFatGrade: extractNumber(/درجة الدهون الحشوية\s+([\d.]+)/, cleanText),
      fatFreeMass: extractNumber(/الكتلة الخالية من الدهون\s+([\d.]+)/, cleanText),
      bodyWaterContent: extractNumber(/محتوى الماء في الجسم\s+([\d.]+)/, cleanText),
      bodyFatRate: extractNumber(/نسبة الدهون في الجسم\s+([\d.]+)/, cleanText),
      proteinRate: extractNumber(/نسبة البروتين\s+([\d.]+)/, cleanText),
      skeletalMusclePercentage: extractNumber(/نسبة العضلات الهيكلية\s+([\d.]+)/, cleanText),
      bodyWaterRate: extractNumber(/نسبة الماء في الجسم\s+([\d.]+)/, cleanText),
    };
  
    const evaluation = {
      bmi: getStatus(metrics.bmi, 18.5, 24.9),
      bodyFatRate: getStatus(metrics.bodyFatRate, 20, 34),
      visceralFatGrade: getStatus(metrics.visceralFatGrade, 1, 9),
      bodyWaterRate: getStatus(metrics.bodyWaterRate, 45, 60),
      skeletalMusclePercentage: getStatus(metrics.skeletalMusclePercentage, 52, 68),
      proteinRate: getStatus(metrics.proteinRate, 16, 20),
    };
  
    return {
      customer,
      scan,
      metrics,
      evaluation,
      rawText: cleanText,
    };
  }