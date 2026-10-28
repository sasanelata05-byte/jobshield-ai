const rules = [
  { id: 'upfront-fee', label: 'Upfront payment or registration fee', severity: 'high', points: 26, re: /\b(registration fee|pay (?:a )?(?:fee|deposit)|security deposit|training fee|processing fee|pay to apply|refundable fee|payment required|buy (?:our|the) (?:kit|course))\b/i, why: 'Legitimate employers generally do not require candidates to pay to receive a job offer.' , action: 'Do not pay. Verify the vacancy using the employer’s official careers page.' },
  { id: 'bank-details', label: 'Sensitive banking or identity information requested early', severity: 'high', points: 22, re: /\b(otp|one.time password|upi pin|card number|cvv|net banking password|bank password|aadhaar (?:number|card)|pan card|passport copy)\b/i, why: 'Sensitive information can be abused for identity theft or account takeover.', action: 'Never share OTPs, PINs, passwords, or unnecessary identity documents with an unverified recruiter.' },
  { id: 'unrealistic-pay', label: 'Unusually high pay or guaranteed income claim', severity: 'medium', points: 12, re: /\b(earn (?:₹|rs\.?|inr)?\s?\d+[,.]?\d*\s?(?:per day|daily)|guaranteed (?:job|income|salary)|no experience.{0,30}(?:high salary|\d+\s?lpa)|easy money|earn lakhs? instantly)\b/i, why: 'Unusually high guaranteed earnings with little detail can be used to attract applicants.', action: 'Compare compensation with similar roles and ask for a formal job description.' },
  { id: 'urgency', label: 'Pressure or urgency language', severity: 'medium', points: 8, re: /\b(urgent hiring|immediate joining only|limited seats|act now|today only|last chance|reply immediately|offer expires in (?:minutes|hours))\b/i, why: 'Pressure tactics can discourage candidates from checking details.', action: 'Pause and independently verify the employer before replying.' },
  { id: 'messaging-app', label: 'Recruitment moved to an informal messaging channel', severity: 'medium', points: 10, re: /\b(telegram|whatsapp only|message me on whatsapp|signal app|dm me on telegram)\b/i, why: 'Moving the entire process to an informal channel can make recruiter identity harder to verify.', action: 'Confirm the recruiter through a company-domain email or official company phone number.' },
  { id: 'personal-email', label: 'Personal email used for company recruitment', severity: 'medium', points: 10, re: /\b(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)\b/i, why: 'A personal email is not proof of fraud, but it deserves additional verification for a claimed corporate role.', action: 'Check the sender domain and contact the company through its official website.' },
  { id: 'vague-role', label: 'Vague job duties or missing role details', severity: 'low', points: 7, re: /\b(no interview required|work from home.{0,25}anyone|simple typing job|copy paste job|no skills needed)\b/i, why: 'Vague duties and minimal screening can hide fee-based or data-harvesting schemes.', action: 'Ask for responsibilities, employment terms, interview stages, and the legal employer name.' },
  { id: 'credential-request', label: 'Request for password or account access', severity: 'high', points: 30, re: /\b(send|share|tell me|provide).{0,35}(password|otp|verification code|login credentials)\b/i, why: 'Recruiters should not need your account passwords or one-time verification codes.', action: 'Do not share credentials. If already shared, change the password and secure the account immediately.' },
  { id: 'suspicious-link', label: 'Link may need closer inspection', severity: 'medium', points: 12, test: (ctx) => inspectUrl(ctx.sourceUrl), dynamic: true },
  { id: 'free-email-url', label: 'Job link uses a URL shortener or unusual host', severity: 'medium', points: 10, test: (ctx) => inspectUrlHost(ctx.sourceUrl), dynamic: true },
  { id: 'company-missing', label: 'Employer identity is not provided', severity: 'low', points: 7, test: (ctx) => !String(ctx.company || '').trim() && /\b(hiring|vacancy|job opening|recruiter|job offer)\b/i.test(ctx.jobText + ' ' + ctx.recruiterMessage), dynamic: true }
];
function inspectUrl(raw) {
  if (!raw || !String(raw).trim()) return false;
  try { const u = new URL(String(raw).trim().startsWith('http') ? String(raw).trim() : `https://${String(raw).trim()}`); return u.protocol !== 'https:'; }
  catch { return true; }
}
function inspectUrlHost(raw) {
  if (!raw || !String(raw).trim()) return false;
  try {
    const u = new URL(String(raw).trim().startsWith('http') ? String(raw).trim() : `https://${String(raw).trim()}`);
    return /(^|\.)(bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|rb\.gy)$/i.test(u.hostname) || /^\d{1,3}(\.\d{1,3}){3}$/.test(u.hostname);
  } catch { return true; }
}
function analyzeJob(ctx) {
  const combined = [ctx.jobText, ctx.recruiterMessage, ctx.company, ctx.role, ctx.salary, ctx.sourceUrl].filter(Boolean).join('\n');
  const findings = [];
  for (const r of rules) {
    const matched = r.test ? r.test(ctx) : r.re.test(combined);
    if (matched) findings.push({ id: r.id, label: r.label, severity: r.severity, points: r.points, explanation: r.why, recommendation: r.action });
  }
  let score = Math.min(100, findings.reduce((sum, f) => sum + f.points, 0));
  // Give a modest baseline when key context is absent, without claiming missing details prove fraud.
  const textLength = combined.length;
  if (textLength < 80 && score < 35) score = Math.min(100, score + 5);
  const level = score >= 60 ? 'high' : score >= 30 ? 'suspicious' : 'lower';
  const verdict = level === 'high' ? 'High risk — verify before proceeding' : level === 'suspicious' ? 'Suspicious — check these warning signs' : 'Fewer warning signs detected';
  const recommendations = [
    'Find the vacancy on the company’s official careers website by navigating there yourself.',
    'Verify the recruiter using contact details published on the official company website.',
    'Never pay application, interview, equipment, training, or release fees to secure a job.',
    'Never share passwords, OTPs, UPI PINs, or banking credentials.',
    'Do not open unexpected attachments or sign in through links sent by an unverified contact.'
  ];
  return { score, level, verdict, findings, recommendations, analyzedAt: new Date().toISOString(), disclaimer: 'This is a heuristic screening tool, not a definitive fraud determination. A low score does not prove a job is legitimate, and a high score does not prove fraud.' };
}
module.exports = { analyzeJob };
