const express = require('express');
const { generateWithFallback } = require('../helpers/aiClient');
const axios = require('axios');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const convertapi = process.env.CONVERTAPI_SECRET 
  ? require('convertapi')(process.env.CONVERTAPI_SECRET)
  : null;

if (!convertapi) {
  console.warn('âš ï¸ CONVERTAPI_SECRET is missing. PDF conversion will be disabled.');
}

// Ensure temp directory exists
const isVercel = process.env.VERCEL === '1';
const tempDir = isVercel ? path.join('/tmp', 'temp') : path.join(__dirname, '..', 'temp');

try {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`Created temp directory at: ${tempDir}`);
  }
} catch (err) {
  console.error('Failed to create temp directory:', err.message);
}

// AI Proposal Text Generation
router.post('/', async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const { text } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Ù…ÙØªØ§Ø­ Gemini API ØºÙŠØ± Ù…ØªÙˆÙØ± ÙÙŠ Ø§Ù„Ø®Ø§Ø¯Ù….' });
  }

  if (!text) {
    return res.status(400).json({ error: 'Ø§Ù„Ø±Ø¬Ø§Ø¡ Ø¥Ø¯Ø®Ø§Ù„ ØªÙØ§ØµÙŠ    const systemInstruction = `Ø£Ù†Øª Ø®Ø¨ÙŠØ± ØªÙ‚Ù†ÙŠ ÙˆØ§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠ Ù…ØªØ®ØµØµ ÙÙŠ Ø¥Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø¹Ø±ÙˆØ¶ Ø§Ù„ÙÙ†ÙŠØ© Ø§Ù„Ø§Ø­ØªØ±Ø§ÙÙŠØ© Ù„Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ Ø§Ù„Ø¨Ø±Ù…Ø¬ÙŠØ©. Ù…Ù‡Ù…ØªÙƒ ØªØ­ÙˆÙŠÙ„ ØªÙØ±ÙŠØº Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ Ø£Ùˆ Ø§Ù„ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ø¯Ø®Ù„Ø© Ø¥Ù„Ù‰ Ø¹Ø±Ø¶ ÙÙ†ÙŠ Ù…ØªÙƒØ§Ù…Ù„ ÙˆØ¬Ø§Ù‡Ø² Ù„Ù„Ø¹Ø±Ø¶ Ø¹Ù„Ù‰ Ø§Ù„Ø¹Ù…ÙŠÙ„ Ù…Ø¨Ø§Ø´Ø±Ø©Ù‹.

Ø§Ù„ØªØ¹Ù„ÙŠÙ…Ø§Øª Ø§Ù„Ø¥Ù„Ø²Ø§Ù…ÙŠØ©:
- Ø§Ø¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰ Ù…Ù† Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ ÙÙ‚Ø· Ù…Ø§ Ù„Ù… ÙŠÙØ­Ø¯ÙŽÙ‘Ø¯ ØºÙŠØ± Ø°Ù„Ùƒ.
- Ø§Ù„Ù†Øµ Ù…ÙØµÙ‘Ù„ØŒ Ø´Ø§Ù…Ù„ØŒ ÙˆÙ„Ø§ ÙŠÙØºÙÙ„ Ø£ÙŠ Ù†Ù‚Ø·Ø©.
- Ø§Ù„Ø£Ø³Ù„ÙˆØ¨: Ø±Ø³Ù…ÙŠØŒ Ø§Ø­ØªØ±Ø§ÙÙŠØŒ Ù…Ø¨Ø§Ø´Ø± â€” ÙƒØ£Ù†Ùƒ ØªØ®Ø§Ø·Ø¨ ØµØ§Ø­Ø¨ Ù‚Ø±Ø§Ø±.
- Ù„Ø§ ØªÙƒØªØ¨ Ø£ÙŠ ØªØ¹Ù„ÙŠÙ‚Ø§Øª Ø¬Ø§Ù†Ø¨ÙŠØ©ØŒ ÙˆÙ„Ø§ Ù…Ù„Ø§Ø­Ø¸Ø§ØªØŒ ÙˆÙ„Ø§ Ù…Ù‚Ø¯Ù…Ø§Øª Ø£Ùˆ Ø®ÙˆØ§ØªÙŠÙ…. Ø£Ø®Ø±Ø¬ Ø§Ù„Ù†ØªÙŠØ¬Ø© ÙÙ‚Ø·.
- ÙŠØ¬Ø¨ Ù…Ù„Ø¡ ÙƒÙ„ Ø®Ù„ÙŠØ© ÙÙŠ Ø§Ù„Ø¬Ø¯Ø§ÙˆÙ„ ÙˆÙƒÙ„ Ù†Ù‚Ø·Ø© ÙÙŠ Ø§Ù„Ø¹Ø±Ø¶ Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ø§Ù„Ø³ÙŠØ§Ù‚. Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø© Ù†Ø§Ù‚ØµØ©ØŒ Ù‚Ù… Ø¨Ø§Ø³ØªÙ†ØªØ§Ø¬Ù‡Ø§ Ø¨Ø°ÙƒØ§Ø¡ Ø§Ø­ØªØ±Ø§ÙÙŠ Ø£Ùˆ Ø§Ø³ØªØ®Ø¯Ù… "ÙŠÙØ­Ø¯Ø¯ Ù„Ø§Ø­Ù‚Ø§Ù‹".
- ÙŠÙ…Ù†Ø¹ Ù…Ù†Ø¹Ø§Ù‹ Ø¨Ø§ØªØ§Ù‹ ØªØ±Ùƒ Ø®Ù„Ø§ÙŠØ§ ÙØ§Ø±ØºØ© Ø£Ùˆ Ø§Ø³ØªØ®Ø¯Ø§Ù… ÙƒÙ„Ù…Ø© "undefined".
- Ø§Ø³ØªØ®Ø¯Ù… ØµÙŠØºØ© MarkdownØŒ ÙˆØªØ£ÙƒØ¯ Ù…Ù† Ø¨Ù†Ø§Ø¡ Ø§Ù„Ø¬Ø¯Ø§ÙˆÙ„ Ø¨Ø´ÙƒÙ„ ØµØ­ÙŠØ­.

Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„Ø¹Ø±Ø¶ Ø§Ù„ÙÙ†ÙŠ (ÙŠØ¬Ø¨ Ø§Ù„Ø§Ù„ØªØ²Ø§Ù… Ø¨Ù‡Ø°Ø§ Ø§Ù„Ù‡ÙŠÙƒÙ„ Ø­Ø±ÙÙŠØ§Ù‹):

### Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„Ø¹Ù…Ù„ Ø§Ù„Ù…Ù‚ØªØ±Ø­ (Business Logic)
| Ø§Ù„Ø­Ù‚Ù„ | Ø§Ù„ØªÙØ§ØµÙŠÙ„ |
|---|---|
| Ù†ÙˆØ¹ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ | [Ø­Ø¯Ø¯ Ù†ÙˆØ¹Ù‡: Ù…ØªØ¬Ø±ØŒ Ù…Ù†ØµØ©ØŒ ØªØ·Ø¨ÙŠÙ‚ØŒ Ø¥Ù„Ø®] |
| Ù†Ø´Ø§Ø· Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ | [Ø­Ø¯Ø¯ Ø§Ù„Ù…Ø¬Ø§Ù„ Ø¨Ø¯Ù‚Ø©] |
| Ù„ØºØ© Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ | [Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© ÙƒØ£Ø³Ø§Ø³ØŒ Ù…Ø¹ Ø°ÙƒØ± Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ© Ø¥Ù† Ù„Ø²Ù…] |
| Ù…ÙƒÙˆÙ†Ø§Øª Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ | [Ø§Ù„ØªØ·Ø¨ÙŠÙ‚Ø§ØªØŒ Ø§Ù„Ù„ÙˆØ­Ø§ØªØŒ Ø¥Ù„Ø®] |
| Ø§Ù„Ù†Ø·Ø§Ù‚ Ø§Ù„Ø¬ØºØ±Ø§ÙÙŠ | [Ø§Ù„Ù…Ù…Ù„ÙƒØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©ØŒ Ø£Ùˆ Ø­Ø³Ø¨ Ø§Ù„Ø³ÙŠØ§Ù‚] |
| Ø§Ù„Ø´Ø±ÙŠØ­Ø© Ø§Ù„Ù…Ø³ØªÙ‡Ø¯ÙØ© | [Ø­Ø¯Ø¯ Ø§Ù„ÙØ¦Ø© Ø¨Ø¯Ù‚Ø©] |

### ÙˆØµÙ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ ÙˆØ§Ù„Ù†Ø·Ø§Ù‚ Ø§Ù„Ø¹Ø§Ù… (Project Understanding & Scope)
A. ÙˆØµÙ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹:
[ÙˆØµÙ Ø´Ø§Ù…Ù„ ÙˆÙ…ÙØµÙ‘Ù„ ÙŠØ¹ÙƒØ³ Ø·Ø¨ÙŠØ¹Ø© Ø§Ù„Ù…Ù†ØµØ© Ø£Ùˆ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ØŒ Ù…Ø¬Ø§Ù„Ù‡ØŒ ÙˆØ¢Ù„ÙŠØ© Ø¹Ù…Ù„Ù‡ Ø§Ù„Ø¬ÙˆÙ‡Ø±ÙŠØ©]

B. Ø§Ù„Ø£Ù‡Ø¯Ø§Ù Ø§Ù„Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ©:
[Ø§Ø°ÙƒØ± Ø§Ù„Ø£Ù‡Ø¯Ø§Ù Ø§Ù„Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ© Ø¨ØµÙŠØºØ© Ù†Ù‚Ø§Ø· ÙˆØ§Ø¶Ø­Ø© ØªØ¨Ø¯Ø£ Ø¨Ø£ÙØ¹Ø§Ù„: Ø§Ù„Ø³ÙŠØ·Ø±Ø© Ø¹Ù„Ù‰ / ØªÙ…ÙƒÙŠÙ† / ØªØ³Ø±ÙŠØ¹ / Ø±ÙØ¹ / Ø®ÙØ¶...]

C. Ù…ÙƒÙˆÙ†Ø§Øª Ø§Ù„Ù…Ø´Ø±ÙˆØ¹:
[Ø§Ø°ÙƒØ± ÙƒÙ„ Ù…ÙƒÙˆÙ† Ø¨Ù…Ø³Ù…Ø§Ù‡ Ø§Ù„ÙˆØ¸ÙŠÙÙŠ ÙˆÙˆØµÙ Ù…Ø®ØªØµØ± Ù„Ø¯ÙˆØ±Ù‡: ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ØŒ Ù„ÙˆØ­Ø© Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©ØŒ Ø§Ù„Ø¨ÙˆØ§Ø¨Ø§ØªØŒ Ø¥Ù„Ø®]

### Ù†Ø·Ø§Ù‚ Ø§Ù„Ø¹Ù…Ù„ Ø§Ù„ÙˆØ¸ÙŠÙÙŠ (Functional Scope of Work)
A. Ù‡ÙŠÙƒÙ„ÙŠØ© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† (System Actors):
Ù„ÙƒÙ„ Ø¬Ù‡Ø© Ù…Ø³ØªØ®Ø¯Ù…Ø©:
- Ø§Ø°ÙƒØ± Ø§Ø³Ù…Ù‡Ø§
- Ø§ÙØµÙ‘Ù„ ØµÙ„Ø§Ø­ÙŠØ§ØªÙ‡Ø§ ÙˆÙ…Ø³Ø§Ø±Ø§ØªÙ‡Ø§ Ø§Ù„ÙˆØ¸ÙŠÙÙŠØ© ÙƒØ§Ù…Ù„Ø©Ù‹ Ø¨Ù†Ù‚Ø§Ø· Ù…Ù†Ø¸Ù‘Ù…Ø© ØªØ­Øª ÙƒÙ„ ÙØ¦Ø©

### Ø±Ø­Ù„Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙˆØ§Ù„Ø¨ÙŠØ¦Ø© Ø§Ù„ØªÙ‚Ù†ÙŠØ© (User Journey & Technical Architecture)
Ø£ÙˆÙ„Ø§Ù‹: Ø³ÙŠÙ†Ø§Ø±ÙŠÙˆ Ø±Ø­Ù„Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… (The Workflow):
[Ø§Ø³Ø±Ø¯ Ø±Ø­Ù„Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø®Ø·ÙˆØ© Ø¨Ø®Ø·ÙˆØ© Ù…Ù† Ù„Ø­Ø¸Ø© Ø¯Ø®ÙˆÙ„Ù‡ Ø­ØªÙ‰ Ø¥ØªÙ…Ø§Ù… Ø§Ù„Ù‡Ø¯Ù Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØŒ Ø¨Ø£Ø³Ù„ÙˆØ¨ Ø³Ø±Ø¯ÙŠ ØªØ³Ù„Ø³Ù„ÙŠ ÙˆØ§Ø¶Ø­]

Ø«Ø§Ù†ÙŠØ§Ù‹: Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„Ø±Ø¨Ø­ (Revenue Model):
ØªÙ… ØªØµÙ…ÙŠÙ… Ø§Ù„Ù†Ø¸Ø§Ù… Ù„ÙŠØ¯Ø¹Ù… Ù…ØµØ§Ø¯Ø± Ø§Ù„Ø¯Ø®Ù„ Ø§Ù„ØªØ§Ù„ÙŠØ©:
[Ø§Ø°ÙƒØ± ÙƒÙ„ Ù…ØµØ¯Ø± Ø±Ø¨Ø­ Ø¨ÙˆØ¶ÙˆØ­]

### ØªÙØ§ØµÙŠÙ„ Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…
[Ø§ÙØµÙ‘Ù„ Ø£Ù‚Ø³Ø§Ù… Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ… Ø§Ù„Ø¥Ø¯Ø§Ø±ÙŠØ© ÙˆØµÙ„Ø§Ø­ÙŠØ§ØªÙ‡Ø§ ÙˆØ£Ø¯ÙˆØ§ØªÙ‡Ø§ Ø¨Ø´ÙƒÙ„ Ù…Ù†Ø¸Ù‘Ù…]

### Ø§Ù„ØªÙ‚ÙŠÙŠÙ… ÙˆØ§Ù„ØªÙƒÙ„ÙØ© ÙˆØ§Ù„Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ø²Ù…Ù†ÙŠ
| Ø§Ù„Ø¨Ù†Ø¯ | Ø§Ù„ØªÙØ§ØµÙŠÙ„ |
|---|---|
| Ø§Ù„ØªÙ‚ÙŠÙŠÙ… | [ØªÙ‚ÙŠÙŠÙ… ÙÙ†ÙŠ Ù…Ø®ØªØµØ±] |
| Ø§Ù„ØªÙƒÙ„ÙØ© | [Ø§ÙƒØªØ¨ "Ø­Ø³Ø¨ Ø§Ù„Ù…ØªÙÙ‚ Ø¹Ù„ÙŠÙ‡" Ø£Ùˆ Ø§Ø³ØªÙ†ØªØ¬Ù‡Ø§ Ø¥Ø°Ø§ Ø°ÙÙƒØ±Øª] |
| Ù…Ø¯Ø© Ø§Ù„Ø¹Ù…Ù„ | [Ù…Ø¯Ø© Ù…Ù†Ø·Ù‚ÙŠØ© Ø¨Ø§Ù„Ø£Ø³Ø§Ø¨ÙŠØ¹ Ø£Ùˆ Ø§Ù„Ø´Ù‡ÙˆØ±] |

Ø¨Ø¹Ø¯ Ø§Ù„Ø§Ù†ØªÙ‡Ø§Ø¡ Ù…Ù† Ø§Ù„Ù†Øµ Ø£Ø¹Ù„Ø§Ù‡ØŒ Ø£Ø¶Ù ÙÙˆØ±Ø§Ù‹ ÙƒØªÙ„Ø© JSON Ø¨Ø±Ù…Ø¬ÙŠØ© ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ù‡ÙŠÙƒÙ„Ø© Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…Ù‡Ø§ ÙÙŠ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¨Ø±Ù…Ø¬ÙŠØŒ ÙŠØ¬Ø¨ Ø£Ù† ØªÙƒÙˆÙ† Ø¯Ø§Ø®Ù„ ÙˆØ³Ù… \` \` \`json ÙˆØªØªØ¨Ø¹ Ø§Ù„Ù‡ÙŠÙƒÙ„ Ø§Ù„ØªØ§Ù„ÙŠ Ø¨Ø¯Ù‚Ø©:
{
  "strategicGoals": [{"name": "..."}],
  "actors": [{"name": "..."}],
  "features": [{"name": "..."}],
  "journeys": [{"name": "..."}],
  "adminFeatures": [{"name": "..."}]
}
ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø£Ù‡Ù… Ø§Ù„Ù†Ù‚Ø§Ø· Ù…Ù† Ø§Ù„Ù†Øµ ÙˆØªÙˆØ²ÙŠØ¹Ù‡Ø§ Ø¹Ù„Ù‰ Ù‡Ø°Ù‡ Ø§Ù„Ù…ØµÙÙˆÙØ§Øª.`;

    const proposal = await generateWithFallback({
      prompt: text,
      systemInstruction
    });
‡Ø§
- Ø§ÙØµÙ‘Ù„ ØµÙ„Ø§Ø­ÙŠØ§ØªÙ‡Ø§ ÙˆÙ…Ø³Ø§Ø±Ø§ØªÙ‡Ø§ Ø§Ù„ÙˆØ¸ÙŠÙÙŠØ© ÙƒØ§Ù…Ù„Ø©Ù‹ Ø¨Ù†Ù‚Ø§Ø· Ù…Ù†Ø¸Ù‘Ù…Ø© ØªØ­Øª ÙƒÙ„ ÙØ¦Ø©

### Ø±Ø­Ù„Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙˆØ§Ù„Ø¨ÙŠØ¦Ø© Ø§Ù„ØªÙ‚Ù†ÙŠØ© (User Journey & Technical Architecture)
Ø£ÙˆÙ„Ø§Ù‹: Ø³ÙŠÙ†Ø§Ø±ÙŠÙˆ Ø±Ø­Ù„Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… (The Workflow):
[Ø§Ø³Ø±Ø¯ Ø±Ø­Ù„Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø®Ø·ÙˆØ© Ø¨Ø®Ø·ÙˆØ© Ù…Ù† Ù„Ø­Ø¸Ø© Ø¯Ø®ÙˆÙ„Ù‡ Ø­ØªÙ‰ Ø¥ØªÙ…Ø§Ù… Ø§Ù„Ù‡Ø¯Ù Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØŒ Ø¨Ø£Ø³Ù„ÙˆØ¨ Ø³Ø±Ø¯ÙŠ ØªØ³Ù„Ø³Ù„ÙŠ ÙˆØ§Ø¶Ø­]

Ø«Ø§Ù†ÙŠØ§Ù‹: Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„Ø±Ø¨Ø­ (Revenue Model):
ØªÙ… ØªØµÙ…ÙŠÙ… Ø§Ù„Ù†Ø¸Ø§Ù… Ù„ÙŠØ¯Ø¹Ù… Ù…ØµØ§Ø¯Ø± Ø§Ù„Ø¯Ø®Ù„ Ø§Ù„ØªØ§Ù„ÙŠØ©:
[Ø§Ø°ÙƒØ± ÙƒÙ„ Ù…ØµØ¯Ø± Ø±Ø¨Ø­ Ø¨ÙˆØ¶ÙˆØ­]

### ØªÙØ§ØµÙŠÙ„ Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…
[Ø§ÙØµÙ‘Ù„ Ø£Ù‚Ø³Ø§Ù… Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ… Ø§Ù„Ø¥Ø¯Ø§Ø±ÙŠØ© ÙˆØµÙ„Ø§Ø­ÙŠØ§ØªÙ‡Ø§ ÙˆØ£Ø¯ÙˆØ§ØªÙ‡Ø§ Ø¨Ø´ÙƒÙ„ Ù…Ù†Ø¸Ù‘Ù…]

### Ø§Ù„ØªÙ‚ÙŠÙŠÙ… ÙˆØ§Ù„ØªÙƒÙ„ÙØ© ÙˆØ§Ù„Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ø²Ù…Ù†ÙŠ
| Ø§Ù„Ø¨Ù†Ø¯ | Ø§Ù„ØªÙØ§ØµÙŠÙ„ |
|---|---|
| Ø§Ù„ØªÙ‚ÙŠÙŠÙ… | [ØªÙ‚ÙŠÙŠÙ… ÙÙ†ÙŠ Ù…Ø®ØªØµØ±] |
| Ø§Ù„ØªÙƒÙ„ÙØ© | [Ø§ÙƒØªØ¨ "Ø­Ø³Ø¨ Ø§Ù„Ù…ØªÙÙ‚ Ø¹Ù„ÙŠÙ‡" Ø£Ùˆ Ø§Ø³ØªÙ†ØªØ¬Ù‡Ø§ Ø¥Ø°Ø§ Ø°ÙÙƒØ±Øª] |
| Ù…Ø¯Ø© Ø§Ù„Ø¹Ù…Ù„ | [Ù…Ø¯Ø© Ù…Ù†Ø·Ù‚ÙŠØ© Ø¨Ø§Ù„Ø£Ø³Ø§Ø¨ÙŠØ¹ Ø£Ùˆ Ø§Ù„Ø´Ù‡ÙˆØ±] |

Ø¨Ø¹Ø¯ Ø§Ù„Ø§Ù†ØªÙ‡Ø§Ø¡ Ù…Ù† Ø§Ù„Ù†Øµ Ø£Ø¹Ù„Ø§Ù‡ØŒ Ø£Ø¶Ù ÙÙˆØ±Ø§Ù‹ ÙƒØªÙ„Ø© JSON Ø¨Ø±Ù…Ø¬ÙŠØ© ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ù‡ÙŠÙƒÙ„Ø© Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…Ù‡Ø§ ÙÙŠ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¨Ø±Ù…Ø¬ÙŠØŒ ÙŠØ¬Ø¨ Ø£Ù† ØªÙƒÙˆÙ† Ø¯Ø§Ø®Ù„ ÙˆØ³Ù… \` \` \`json ÙˆØªØªØ¨Ø¹ Ø§Ù„Ù‡ÙŠÙƒÙ„ Ø§Ù„ØªØ§Ù„ÙŠ Ø¨Ø¯Ù‚Ø©:
{
  "strategicGoals": [{"name": "..."}],
  "actors": [{"name": "..."}],
  "features": [{"name": "..."}],
  "journeys": [{"name": "..."}],
  "adminFeatures": [{"name": "..."}]
}
ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø£Ù‡Ù… Ø§Ù„Ù†Ù‚Ø§Ø· Ù…Ù† Ø§Ù„Ù†Øµ ÙˆØªÙˆØ²ÙŠØ¹Ù‡Ø§ Ø¹Ù„Ù‰ Ù‡Ø°Ù‡ Ø§Ù„Ù…ØµÙÙˆÙØ§Øª.`,
    });

    const result = await model.generateContent(text);
    const proposal = result.response.text();
    res.json({ success: true, proposal });

  } catch (error) {
    console.error('Gemini API Error (Proposals):', error.message);
    
    if (error.message === 'ALL_MODELS_EXHAUSTED') {
      return res.status(429).json({
        error: error.message,
        retryAfter: error.retryAfter
      });
    }

    res.status(500).json({ 
      error: 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ.',
      details: error.message
    });
  }
});

// Generate DOCX
router.post('/generate-docx', async (req, res) => {
  try {
    const data = req.body;
    const templatePath = path.join(__dirname, '..', '..', 'templates', 'quotation.docx');

    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: 'Ù…Ù„Ù Ø§Ù„Ù‚Ø§Ù„Ø¨ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯ ÙÙŠ templates/quotation.docx' });
    }

    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Render the document
    doc.render(data);

    const buf = doc.getZip().generate({ type: 'nodebuffer' });
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename=quotation_${Date.now()}.docx`,
    });
    
    res.send(buf);
  } catch (error) {
    console.error('Proposal Generation Error:', error);
    res.status(500).json({ 
      error: 'ÙØ´Ù„ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¹Ø±Ø¶ Ø§Ù„ÙÙ†ÙŠ',
      details: error.message || 'Unknown error'
    });
  }
});

// Generate PDF
router.post('/generate-pdf', async (req, res) => {
  const CONVERTAPI_SECRET = process.env.CONVERTAPI_SECRET;
  if (!CONVERTAPI_SECRET) {
    return res.status(500).json({ error: 'Ù…ÙØªØ§Ø­ ConvertAPI ØºÙŠØ± Ù…ØªÙˆÙØ± ÙÙŠ Ø§Ù„Ø®Ø§Ø¯Ù….' });
  }

  try {
    const data = req.body;
    const templatePath = path.join(__dirname, '..', '..', 'templates', 'quotation.docx');

    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: 'Ù…Ù„Ù Ø§Ù„Ù‚Ø§Ù„Ø¨ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯ ÙÙŠ templates/quotation.docx' });
    }

    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.render(data);
    const buf = doc.getZip().generate({ type: 'nodebuffer' });

    const docxPath = path.join(tempDir, `template_${Date.now()}.docx`);
    fs.writeFileSync(docxPath, buf);

    // Convert to PDF
    const result = await convertapi.convert('pdf', { File: docxPath }, 'docx');
    const pdfUrl = result.file.url;
    
    // Download and send PDF
    const pdfResponse = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    
    // Clean up temporary file
    fs.unlinkSync(docxPath);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=quotation_${Date.now()}.pdf`,
    });
    
    res.send(Buffer.from(pdfResponse.data));
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      error: 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ ØªÙˆÙ„ÙŠØ¯ Ù…Ù„Ù PDF',
      details: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      failedAt: 'PDF Conversion/Generation'
    });
  }
});

module.exports = router;
