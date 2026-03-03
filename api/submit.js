// Input sanitization
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '')           // Strip HTML tags
    .replace(/javascript:/gi, '')    // Remove JS protocol
    .replace(/on\w+\s*=/gi, '')     // Remove event handlers
    .replace(/['";\\]/g, '')        // Remove quotes and backslashes
    .replace(/(\b)(union|select|insert|update|delete|drop|alter|exec|execute|script|eval|expression)(\b)/gi, '') // SQL/XSS keywords
    .trim()
    .slice(0, 1000);                // Max length cap
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length < 254;
}

const ALLOWED_SERVICES = [
  'ISO/IEC 27001:2022', 'SOC 2 Type 1 & Type 2', 'CryptoCurrency Security Standard', 'PCI DSS',
  'Vulnerability Scanning', 'Penetration Testing', 'Dark Web & OSINT Monitoring',
  'GAP Assessment', 'Risk Management', 'Third-Party Risk Management',
  'Documentation Development', 'Security Awareness Training', 'Security Vendor Management',
  'DORA / MiCA Compliance', 'VARA Compliance', 'CBUAE Compliance',
  'BMA Compliance', 'BVI Compliance', 'SFC Compliance', 'Custom Proposal'
];

const ALLOWED_CHANNELS = ['Telegram', 'Email', 'WhatsApp', 'Signal', 'Phone Call'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = req.body;

    // Validate required fields exist
    if (!data.name || !data.email || !data.company || !data.service || !data.expectations || !data.contactChannel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email format
    if (!validateEmail(data.email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Validate against allowed values (prevents injection via select fields)
    if (!ALLOWED_SERVICES.includes(data.service)) {
      return res.status(400).json({ error: 'Invalid service' });
    }
    if (!ALLOWED_CHANNELS.includes(data.contactChannel)) {
      return res.status(400).json({ error: 'Invalid contact channel' });
    }

    // Sanitize all text inputs
    const sanitized = {
      name: sanitize(data.name),
      email: sanitize(data.email),
      company: sanitize(data.company),
      service: data.service,
      expectations: sanitize(data.expectations),
      contactChannel: data.contactChannel,
      nickname: sanitize(data.nickname || ''),
      contactEmail: data.contactEmail ? sanitize(data.contactEmail) : ''
    };

    // Reject if sanitized required fields are empty (were entirely malicious)
    if (!sanitized.name || !sanitized.email || !sanitized.company || !sanitized.expectations) {
      return res.status(400).json({ error: 'Invalid input detected' });
    }

    // Forward to Formspree server-side
    const response = await fetch('https://formspree.io/f/meelbwqj', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(sanitized)
    });

    const result = await response.json();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Submit error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
