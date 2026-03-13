const express = require('express');
const { generateWithFallback } = require('../helpers/aiClient');
const axios = require('axios');
const router = express.Router();
const supabase = require('../supabase');

router.post('/', async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const { prep_id, title, client_name, sector, idea_raw } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    console.error('Environment Check - GEMINI_API_KEY is missing');
    return res.status(500).json({ 
      error: 'مفتاح Gemini API غير متوفر في الخادم.',
    });
  }

  if (!idea_raw || !title) {
    return res.status(400).json({ error: 'العنوان وفكرة العميل مطلوبان للتحليل.' });
  }

  try {
    const systemInstruction = `أنت العقل الاستراتيجي (Strategic Brain) لمنظومة Sales Focus AI.
أجب بصيغة JSON فقط وبدقة متناهية وبدون مقدمات. استخدم مفردات البزنس السعودي.
الهيكل المطلوب:
{
  "key_message": "...",
  "business_analysis": { "main_goal": "...", "current_problem": "...", "target_users": [], "expected_platforms": [] },
  "meeting_plan": { "opening": "...", "next_step": "..." },
  "discovery_questions": { "business": [], "technical": [], "scope": [] },
  "user_journeys": [ { "user_type": "...", "steps": [] } ]
}`;

    const userPrompt = `بيانات الاجتماع:
- العنوان: ${title}
- العميل: ${client_name || 'غير محدد'}
- القطاع: ${sector || 'تجارة'}
- الفكرة: ${idea_raw}

نفذ التحليل الاستراتيجي الآن وقدم التقرير بصيغة JSON.`;

    let analysisText = await generateWithFallback({
      prompt: userPrompt,
      systemInstruction,
      responseMimeType: "application/json"
    });

    let analysis = JSON.parse(analysisText);

    // Save to Supabase if prep_id provided
    if (prep_id) {
       await supabase
         .from('meeting_preps')
         .update({ 
           analysis_result: analysis, 
           updated_at: new Date().toISOString() 
         })
         .eq('id', prep_id);
    }

    res.json(analysis);

  } catch (error) {
    console.error('Analysis error:', error);
    
    if (error.message === 'ALL_MODELS_EXHAUSTED') {
      return res.status(429).json({
        error: error.message,
        retryAfter: error.retryAfter
      });
    }

    res.status(500).json({ 
      error: 'فشل تحليل التحضير عبر الذكاء الاصطناعي',
      details: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      failedAt: 'AI Waterfall Analysis'
    });
  }
});

module.exports = router;


