const axios = require('axios');

async function generateWithFallback({ prompt, systemInstruction, responseMimeType }) {
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.0-pro'
  ];
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) throw new Error('GEMINI_API_KEY_MISSING');

  // دمج systemInstruction مع الـ prompt مباشرةً
  const fullPrompt = systemInstruction
    ? `${systemInstruction}\n\n---\n\n${typeof prompt === 'string' ? prompt : JSON.stringify(prompt)}`
    : (typeof prompt === 'string' ? prompt : JSON.stringify(prompt));

  for (const modelName of models) {
    try {
      console.log(`🤖 Attempting model via REST API: ${modelName}`);

      const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;

      const body = {
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7
        }
      };

      const response = await axios.post(url, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 55000
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from Gemini API');

      console.log(`✅ Success with model: ${modelName}`);
      return text;

    } catch (error) {
      const status = error.response?.status;
      if (error.response?.data) {
        console.error(`📋 Google API Error:`, JSON.stringify(error.response.data));
      }
      const isRateLimit = status === 429 ||
        error.message?.includes('429') ||
        error.message?.includes('Resource has been exhausted');

      if (isRateLimit) {
        console.warn(`⚠️ Rate limited on ${modelName}, trying next...`);
        continue;
      }
      console.error(`❌ Non-rate-limit error on ${modelName}:`, error.message);
      throw error;
    }
  }

  const exhaustionError = new Error('ALL_MODELS_EXHAUSTED');
  exhaustionError.message = 'خدمة الذكاء الاصطناعي مشغولة حالياً. الرجاء المحاولة بعد دقيقتين.';
  exhaustionError.retryAfter = 120;
  throw exhaustionError;
}

module.exports = { generateWithFallback };
