const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables (only in non-production)
if (process.env.NODE_ENV !== 'production') {
  try {
    const dotenv = require('dotenv');
    dotenv.config(); // Loads from process.cwd()
    dotenv.config({ path: path.join(__dirname, '.env') }); // Loads from /server/.env
    dotenv.config({ path: path.join(__dirname, '..', '.env') }); // Loads from root/.env
  } catch (e) {
    console.warn('Dotenv loading skipped or failed:', e.message);
  }
}
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Server starting initialization...');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Vercel environment: ${process.env.VERCEL === '1' ? 'Yes' : 'No'}`);
console.log(`Supabase URL configured: ${process.env.SUPABASE_URL ? 'Yes' : 'No'}`);
console.log(`Gemini Key configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const isVercel = process.env.VERCEL === '1';
const uploadsDir = isVercel ? path.join('/tmp', 'uploads') : path.join(__dirname, 'uploads');

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory at: ${uploadsDir}`);
  }
} catch (err) {
  console.error(`Failed to create uploads directory: ${err.message}`);
}

app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/clients', require('./routes/clients'));
app.use('/api/files', require('./routes/files'));
app.use('/api/analyze-idea', require('./routes/analyze'));
app.use('/api/meeting-preps', require('./routes/meetingPreps'));
app.use('/api/analyze-prep', require('./routes/analyzePrep'));
app.use('/api/proposals', require('./routes/proposals'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health-Check Endpoint (Self-Diagnostic System)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    isVercel: !!process.env.VERCEL,
    diagnostics: {
      supabaseUrlLoaded: !!process.env.SUPABASE_URL,
      supabaseAnonKeyLoaded: !!process.env.SUPABASE_ANON_KEY,
      geminiKeyLoaded: !!process.env.GEMINI_API_KEY,
      convertApiLoaded: !!process.env.CONVERTAPI_SECRET
    }
  });
});

// Remove old debug routes if any or keep for compatibility
app.get('/api/debug-status', (req, res) => res.redirect('/api/health'));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Sales Focus Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
