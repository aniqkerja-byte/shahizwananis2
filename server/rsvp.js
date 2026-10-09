import { JWT } from 'google-auth-library';
import { validateRsvp } from '../src/rsvp.js';

// These are server-only variables, never VITE_* or sent to the browser.
export async function appendRsvp(values, env = process.env, client) {
  const sheetId = env.GOOGLE_SHEET_ID;
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!sheetId || !email || !key) throw new Error('RSVP_NOT_CONFIGURED');
  const auth = client ?? new JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const range = encodeURIComponent("'RSVP'!A:D");
  const timestamp = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Kuala_Lumpur', dateStyle: 'short', timeStyle: 'medium',
  }).format(new Date());
  const response = await auth.request({
    url: `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${range}:append`,
    method: 'POST',
    params: { valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS' },
    // RAW keeps guest names beginning with '=' as text, never formulas.
    data: { values: [[timestamp, values.name, values.attendance === 'yes' ? 'Hadir' : 'Tidak hadir', values.pax]] },
    retry: false,
    timeout: 15000,
  });
  if (response.data?.updates?.updatedRows !== 1) throw new Error('RSVP_WRITE_NOT_CONFIRMED');
}

export function createRsvpHandler(save = appendRsvp) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const send = (status, body) => { res.statusCode = status; res.end(JSON.stringify(body)); };
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(405, { ok: false }); }
    if (!req.headers['content-type']?.startsWith('application/json')) return send(415, { ok: false });
    // Reject cross-site browser submissions; no public CORS access is needed.
    const origin = req.headers.origin;
    const host = req.headers.host;
    if (origin) {
      try { if (new URL(origin).host !== host) return send(403, { ok: false }); }
      catch { return send(403, { ok: false }); }
    }
    let body;
    try {
      if (req.body !== undefined) {
        if (Buffer.byteLength(typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) > 4096) return send(413, { ok: false });
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } else {
        const chunks = []; let length = 0;
        for await (const chunk of req) {
          length += Buffer.byteLength(chunk);
          if (length > 4096) return send(413, { ok: false });
          chunks.push(Buffer.from(chunk));
        }
        body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      }
      if (!body || typeof body !== 'object' || Array.isArray(body)) return send(400, { ok: false });
    } catch { return send(400, { ok: false }); }
    const errors = validateRsvp(body);
    if (Object.keys(errors).length) return send(400, { ok: false, errors });
    const values = { name: body.name.trim(), attendance: body.attendance, pax: body.attendance === 'yes' ? Number(body.pax) : 0 };
    try {
      await save(values);
      return send(200, { ok: true });
    } catch (error) {
      // Never log names, credentials or the Google error response body.
      console.error('RSVP save failed', error.message === 'RSVP_NOT_CONFIGURED' ? 'not configured' : 'upstream error');
      return send(503, { ok: false });
    }
  };
}
