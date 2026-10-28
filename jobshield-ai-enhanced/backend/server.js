const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { analyzeJob } = require('./analyzer');

const app = express();
const PORT = process.env.PORT || 3000;
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '80kb' }));
app.use('/api/', rateLimit({ windowMs: 60 * 1000, limit: 45, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'JobShield AI API', version: '2.0.0' }));
app.post('/api/analyze', (req, res) => {
  const { jobText = '', company = '', role = '', salary = '', sourceUrl = '', recruiterMessage = '' } = req.body || {};
  const text = [jobText, recruiterMessage, company, role, salary, sourceUrl].join('\n').trim();
  if (text.length < 20) return res.status(400).json({ error: 'Add at least 20 characters of job details, a recruiter message, or a link to analyze.' });
  if (text.length > 20000) return res.status(413).json({ error: 'Please keep the combined content under 20,000 characters.' });
  return res.json(analyzeJob({ jobText, company, role, salary, sourceUrl, recruiterMessage }));
});
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));
app.listen(PORT, () => console.log(`JobShield AI running at http://localhost:${PORT}`));
