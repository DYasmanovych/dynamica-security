import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+\s*=/gi, '').replace(/['";\\]/g, '').replace(/(\b)(union|select|insert|update|delete|drop|alter|exec|execute|script|eval|expression)(\b)/gi, '').trim().slice(0, 1000);
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

    if (!data.name || !data.email || !data.company || !data.service || !data.expectations || !data.contactChannel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!validateEmail(data.email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    if (!ALLOWED_SERVICES.includes(data.service)) {
      return res.status(400).json({ error: 'Invalid service' });
    }
    if (!ALLOWED_CHANNELS.includes(data.contactChannel)) {
      return res.status(400).json({ error: 'Invalid channel' });
    }

    const s = {
      name: sanitize(data.name),
      email: sanitize(data.email),
      company: sanitize(data.company),
      service: data.service,
      expectations: sanitize(data.expectations),
      contactChannel: data.contactChannel,
      nickname: sanitize(data.nickname || ''),
      contactEmail: sanitize(data.contactEmail || '')
    };

    if (!s.name || !s.email || !s.company || !s.expectations) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const { error } = await resend.emails.send({
      from: 'Dynamica Security <hello@dynamica.consulting>',
      to: 'hello@dynamica.consulting',
      subject: `New Lead: ${s.name} — ${s.service}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a1118;color:#e8edf2;padding:32px;border-radius:12px;">
          <div style="border-bottom:2px solid #00e5a0;padding-bottom:16px;margin-bottom:24px;">
            <h1 style="color:#00e5a0;font-size:20px;margin:0;">New Lead from Dynamica Website</h1>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#7a8ea0;width:140px;">Name</td><td style="padding:8px 0;font-weight:bold;">${s.name}</td></tr>
            <tr><td style="padding:8px 0;color:#7a8ea0;">Email</td><td style="padding:8px 0;">${s.email}</td></tr>
            <tr><td style="padding:8px 0;color:#7a8ea0;">Company</td><td style="padding:8px 0;font-weight:bold;">${s.company}</td></tr>
            <tr><td style="padding:8px 0;color:#7a8ea0;">Service</td><td style="padding:8px 0;"><span style="background:#00e5a020;color:#00e5a0;padding:4px 10px;border-radius:4px;font-size:13px;">${s.service}</span></td></tr>
            <tr><td style="padding:8px 0;color:#7a8ea0;">Contact Via</td><td style="padding:8px 0;">${s.contactChannel}</td></tr>
            <tr><td style="padding:8px 0;color:#7a8ea0;">Nickname</td><td style="padding:8px 0;">${s.nickname || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#7a8ea0;">Contact Email</td><td style="padding:8px 0;">${s.contactEmail || '—'}</td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:#0d1a24;border-radius:8px;border-left:3px solid #00e5a0;">
            <div style="color:#7a8ea0;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Expectations</div>
            <div style="line-height:1.6;">${s.expectations}</div>
          </div>
          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #142030;color:#3a4f62;font-size:12px;">
            Sent from dynamica website • ${new Date().toISOString()}
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Email failed' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
