const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const router = express.Router();
const supabase = require('../supabase');

router.post('/', async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const { client_idea, client_name, sector, client_id } = req.body;
  
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'مفتاح Gemini API غير متوفر في الخادم.' });
  }

  if (!client_idea) return res.status(400).json({ error: 'فكرة العميل مطلوبة' });

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: `أنت العقل الاستراتيجي (Strategic Brain) لمنظومة Sales Focus AI.
أجب بصيغة JSON فقط، بدون مقدمات. استخدم مفردات البزنس السعودي.
الهيكل المطلوبة:
{
  "key_message": "...",
  "business_analysis": { "main_goal": "...", "current_problem": "...", "target_users": [], "expected_platforms": [] },
  "discovery_questions": { "business": [], "technical": [], "scope": [] },
  "user_journeys": [ { "user_type": "...", "steps": [] } ],
  "meeting_plan": { "opening": "...", "key_message": "...", "next_step": "..." }
}`,
    });

    const userPrompt = `الفكرة: ${client_idea}
العميل: ${client_name || 'العميل'}
القطاع: ${sector || 'تجارة'}

حلل الفكرة استراتيجياً وقدم الـ JSON المطلوب.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    let analysis = result.response.text();
    if (typeof analysis === 'string') {
      analysis = JSON.parse(analysis);
    }

    // Save to Supabase if client_id provided
    if (client_id) {
      await supabase
        .from('meeting_analyses')
        .insert([{ client_id, client_idea, analysis_result: analysis }]);
    }

    res.json({ success: true, analysis });
  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(500).json({ error: 'حدث خطأ أثناء تحليل الفكرة عبر الذكاء الاصطناعي.' });
  }
});

// Get analyses for a client
router.get('/:clientId', async (req, res) => {
  try {
    const { data: analyses, error } = await supabase
      .from('meeting_analyses')
      .select('*')
      .eq('client_id', req.params.clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(analyses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
