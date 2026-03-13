const express = require('express');
const { generateWithFallback } = require('../helpers/aiClient');
const axios = require('axios');
const router = express.Router();
const supabase = require('../supabase');

router.post('/', async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const { prep_id, title, client_name, sector, idea_raw } = req.body;

  if (!process.env.DEEPSEEK_API_KEY) {
    console.error('Environment Check - DEEPSEEK_API_KEY is missing');
    return res.status(500).json({ 
      error: '\u0645\u0641\u062a\u0627\u062d \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631 \u0641\u064a \u0627\u0644\u062e\u0627\u062f\u0645.',
    });
  }

  if (!title || !idea_raw) {
    return res.status(400).json({ error: '\u062c\u0645\u064a\u0631 \u0627\u0644\u062d\u0642\u0648\u0644 \u0645\u0637\u0644\u0648\u0628\u0629' });
  }

  try {
    const systemInstruction = `أنت الحين تشتغل كـ "محلل أعمال تقني" (Business Analyst) و "مدير منتجات" (Product Manager) خبرة في شركة سعودية رائدة لتطوير التطبيقات والمواقع.
الهدف: أنا زميلك بالشركة، وأبيك تفزع لي في التجهيز لاجتماعات العملاء (Discovery Meetings). بعطيك فكرة مبدئية لتطبيق أو موقع طلبها العميل، وأبيك بناءً عليها تجهز لي "تقرير تحضيري مفصل جداً واحترافي" أبيض فيه وجهي قدام العميل.

ممنوع الاختصار نهائياً: أبي كل نقطة بخصوص نطاق العمل (Scope) وورك فلو (Workflow) المشروع يتم تفصيله بدقة، سواء كان تطبيق أو موقع. لا تغفل أي تفاصيل تشغيلية أو تقنية أو منطقية.

أجب بصيغة JSON فقط وبدقة متناهية وبدون مقدمات. استخدم مفردات البزنس السعودية (البيضاء) الفخمة.

الهيكل المطلوب للـ JSON:
{
  "project_idea": {
    "summary": "شرح الفكرة بطريقة سلسة وواضحة جداً وتفصيلية (اكتب فقرة دسمة)",
    "core_features": ["ميزة أساسية 1 مع شرح بسيط", "ميزة أساسية 2 مع شرح بسيط"]
  },
  "business_analysis": {
    "main_goal": "الهدف التجاري الأساسي والعميق للمشروع",
    "current_problem": "المشكلة اللي يحلها المشروع بتفصيل",
    "target_users": ["فئة 1 بدقة", "فئة 2 بدقة"],
    "expected_platforms": ["iOS", "Android", "Web", "Admin Panel"]
  },
  "user_journeys": [
    {
      "user_type": "نوع المستخدم (مثلاً: عميل / مزود خدمة / مندوب)",
      "onboarding": ["خطوات التسجيل والترحيب بالتفصيل الممل"],
      "core_journey": ["الرحلة الأساسية خطوة بخطوة من البداية للنهاية بدون إغفال أي زر أو إجراء"],
      "system_actions": ["وش يسوي النظام في الخلفية؟ (تنبيهات، تغيير حالات، عمليات حسابية)"],
      "end_of_journey": ["كيف تنتهي الرحلة؟ (تقييم، فواتير، إغلاق طلب)"]
    }
  ],
  "admin_panel": {
    "user_management": ["إدارة المستخدمين بكافة تفاصيلها (صلاحيات، تجميد، مراجعة)"],
    "operations_management": ["إدارة العمليات المركزية (تدقيق، قبول، رفض، تتبع دقيق)"],
    "settings_content": ["إدارة المحتوى والإشعارات والأكواد الترويجية والصفحات"],
    "financial_reports": ["التقارير المالية والتشغيلية ولوحات القيادة (Dashboards)"]
  },
  "meeting_plan": {
    "opening": "جملة افتتاحية احترافية تسحب انتباه العميل",
    "next_step": "الهدف التالي والمحدد من الاجتماع (CTA) للحصول على انطباع احترافي"
  },
  "technical_workflow_questions": {
    "workflows": ["أسئلة دقيقة جداً عن منطق العمل المعقد (ماذا لو..؟ كيف يتم..؟)"],
    "edge_cases": ["الحالات الاستثنائية (الكنسلة، الفشل، التأخير، استرجاع المبالغ)"],
    "integrations": ["بوابات الدفع، الرسائل، الخرائط، أنظمة المحاسبة، الربط مع جهات خارجية"],
    "permissions": ["المستويات الوظيفية، الصلاحيات المتقاطعة، الأدوار"]
  },
  "discovery_questions": {
     "business": ["أسئلة عن التحقق من الربحية ونموذج العمل"],
     "technical": ["أسئلة عن البيئة التقنية والبيقية السابقة"],
     "scope": ["أسئلة لضبط حدود العمل ومنع الـ Scope Creep"]
  }
}`;

    const userPrompt = `بيانات الاجتماع:
- العنوان: ${title}
- العميل: ${client_name || 'غير محدد'}
- القطاع: ${sector || 'تجارة'}
- الفكرة: ${idea_raw}

نفذ التحليل الاستراتيجي الآن وقدم التقرير بصيغة JSON بالعامية السعودية الاحترافية.`;

    let analysisText = await generateWithFallback({
      prompt: userPrompt,
      systemInstruction,
      responseMimeType: "application/json"
    });

    let analysis = JSON.parse(analysisText);

    if (prep_id) {
      await supabase
        .from('meeting_preps')
        .update({ analysis_result: analysis })
        .eq('id', prep_id);
    }

    res.json({ success: true, analysis });

  } catch (error) {
    console.error('Analysis error:', error);
    
    if (error.message === 'ALL_MODELS_EXHAUSTED') {
      return res.status(429).json({
        error: error.message,
        retryAfter: error.retryAfter
      });
    }

    res.status(500).json({ 
      error: '\u0641\u0634\u0644 \u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u062a\u062d\u0636\u064a\u0631 \u0639\u0628\u0631 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a',
      details: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      failedAt: 'AI Waterfall Analysis'
    });
  }
});

module.exports = router;
