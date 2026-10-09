import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRsvpHandler, appendRsvp } from './rsvp.js';

async function request(body, save, overrides = {}) {
  const req = { method: 'POST', headers: { host: 'example.com', origin: 'https://example.com', 'content-type': 'application/json' }, body, ...overrides };
  const headers = {};
  const res = { setHeader: (k, v) => headers[k] = v, end: value => res.body = JSON.parse(value) };
  await createRsvpHandler(save)(req, res);
  return res;
}

test('valid RSVP saves only normalized fields; success waits for storage', async () => {
  let saved;
  const res = await request({ name: '  =Tetamu  ', attendance: 'yes', pax: '3', sheetId: 'attacker' }, async row => { saved = row; });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(saved, { name: '=Tetamu', attendance: 'yes', pax: 3 });
  assert.deepEqual(res.body, { ok: true });
});
test('declining always stores zero guests', async () => {
  let saved;
  await request({ name: 'Tetamu', attendance: 'no', pax: 50 }, async row => saved = row);
  assert.equal(saved.pax, 0);
});
test('invalid fields and malformed bodies never write', async () => {
  let writes = 0;
  const save = async () => writes++;
  for (const body of [null, [], 'invalid json', { name: 123 }, { name: ' ', attendance: 'yes', pax: 2 }, { name: 'Tetamu', attendance: 'maybe' }, { name: 'Tetamu', attendance: 'yes', pax: 2.5 }, { name: 'Tetamu', attendance: 'yes', pax: 100 }]) {
    assert.equal((await request(body, save)).statusCode, 400);
  }
  assert.equal(writes, 0);
});
test('wrong method, content type, origin, and oversized body are rejected', async () => {
  const fail = async () => assert.fail('must not write');
  assert.equal((await request({}, fail, { method: 'GET' })).statusCode, 405);
  assert.equal((await request({}, fail, { headers: {} })).statusCode, 415);
  assert.equal((await request({}, fail, { headers: { host: 'example.com', origin: 'https://other.com', 'content-type': 'application/json' } })).statusCode, 403);
  assert.equal((await request({ name: 'x'.repeat(5000) }, fail)).statusCode, 413);
});
test('storage failures do not report success or expose upstream errors', async () => {
  const res = await request({ name: 'Tetamu', attendance: 'yes', pax: 1 }, async () => { throw new Error('secret'); });
  assert.equal(res.statusCode, 503);
  assert.deepEqual(res.body, { ok: false });
  await assert.rejects(appendRsvp({}, {}), /RSVP_NOT_CONFIGURED/);
});

test('Google append targets the configured sheet with RAW values and no automatic retry', async () => {
  let sent;
  const env = { GOOGLE_SHEET_ID: 'configured-sheet', GOOGLE_SERVICE_ACCOUNT_EMAIL: 'test@example.com', GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: 'test-key' };
  const client = { request: async options => { sent = options; return { data: { updates: { updatedRows: 1 } } }; } };
  await appendRsvp({ name: '=SUM(A1)', attendance: 'yes', pax: 2 }, env, client);
  assert.match(sent.url, /spreadsheets\/configured-sheet\/values\//);
  assert.deepEqual(sent.params, { valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS' });
  assert.deepEqual(sent.data.values[0].slice(1), ['=SUM(A1)', 'Hadir', 2]);
  assert.match(sent.data.values[0][0], /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  assert.equal(sent.retry, false);
  await assert.rejects(appendRsvp({name:'Test',attendance:'no',pax:0}, env, {request:async () => ({data:{updates:{updatedRows:0}}})}), /WRITE_NOT_CONFIRMED/);
});
