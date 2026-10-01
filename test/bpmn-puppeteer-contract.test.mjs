/** Installed Puppeteer API checks, without launching Chrome or replacing product import APIs. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { CdpKeyboard, CdpMouse } from 'puppeteer-core/internal/cdp/Input.js';
import { CdpPage } from 'puppeteer-core/internal/cdp/Page.js';
import { CdpElementHandle } from 'puppeteer-core/internal/cdp/ElementHandle.js';
import { FileChooser } from 'puppeteer-core/internal/common/FileChooser.js';
import { productionImportCases, runImportGroups } from './bpmn-import-browser.mjs';

test('installed Keyboard.sendCharacter forwards complete multiline XML through native CDP insertion', async () => {
  const events = [];
  const keyboard = new CdpKeyboard({ async send(method, payload) { events.push({ method, payload }); } });
  assert.equal(typeof keyboard.sendCharacter, 'function');
  assert.equal(keyboard.insertText, undefined, 'Puppeteer has no Playwright-style keyboard.insertText method');
  for (const fixture of ['order-payment-delivery', 'approval-rejection-rework', 'booking-timeout-compensation']) {
    const xml = await readFile(`public/bpmn-samples/scenarios/${fixture}.bpmn`, 'utf8');
    events.length = 0;
    await keyboard.sendCharacter(xml);
    assert.deepEqual(events, [{ method: 'Input.insertText', payload: { text: xml } }]);
  }
  events.length = 0;
  const unicode = '<!-- ı İ 日本語 😀 -->\n<xml attr="a &amp; b">\n  text\n</xml>';
  await keyboard.sendCharacter(unicode);
  assert.deepEqual(events, [{ method: 'Input.insertText', payload: { text: unicode } }]);
});

test('all literal Page/Keyboard/Mouse calls in the production harness exist in the installed Puppeteer implementation', async () => {
  const sources = await Promise.all(['test/bpmn-browser.mjs', 'test/bpmn-import-browser.mjs'].map(file => readFile(file, 'utf8')));
  const owners = { page: CdpPage.prototype, keyboard: CdpKeyboard.prototype, mouse: CdpMouse.prototype };
  const observed = new Set();
  for (const source of sources) {
    for (const match of source.matchAll(/\bpage(?:\?\.|\.)(?:(keyboard|mouse)\.)?(\$\$eval|\$eval|\$\$|\$|[A-Za-z]\w*)\s*\(/g)) {
      const kind = match[1] || 'page', method = match[2];
      assert.equal(typeof owners[kind][method], 'function', `${kind}.${method} must be an installed Puppeteer method`);
      observed.add(`${kind}.${method}`);
    }
  }
  for (const expected of ['keyboard.sendCharacter', 'keyboard.press', 'mouse.move', 'page.waitForFileChooser', 'page.goto', 'page.$eval', 'page.screenshot', 'page.close']) assert.ok(observed.has(expected), expected);
  assert.equal(typeof CdpElementHandle.prototype.uploadFile, 'function');
  assert.equal(typeof CdpElementHandle.prototype.boundingBox, 'function');
  assert.equal(typeof FileChooser.prototype.cancel, 'function');
});

test('all eight import groups are isolated and reported after earlier open/setup/action/check/capture/cleanup failures', async () => {
  const registered = productionImportCases();
  assert.equal(registered.length, 8); assert.equal(new Set(registered.map(group => group.id)).size, 8);
  const opened = [], ran = [], captured = [], closed = [], reports = [];
  const groups = registered.map((group, index) => ({ ...group, async run(context) {
    ran.push(group.id); assert.equal(context.token, index);
    if (index === 0) throw new Error('First action fails');
  } }));
  const results = await runImportGroups(groups, async group => {
    const index = registered.findIndex(value => value.id === group.id); opened.push(group.id);
    if (index === 5) throw new Error("Sixth open fails");
    return {
      token: index,
      async setup() { if (index === 1) throw new Error('Second setup fails'); },
      async check() { if (index === 4) throw new Error("Fifth check fails"); },
      async capture() { captured.push(group.id); if (index === 2) throw new Error('Third capture fails'); },
      async close() { closed.push(group.id); if (index === 3) throw new Error('Fourth cleanup fails'); },
    };
  }, async values => reports.push(values.length));
  assert.deepEqual(opened, registered.map(group => group.id));
  assert.deepEqual(captured, opened.filter((_, index) => index !== 5)); assert.deepEqual(closed, captured);
  assert.deepEqual(ran, registered.filter((_, index) => ![1, 5].includes(index)).map(group => group.id));
  assert.deepEqual(reports, [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(results.map(result => result.status), ['failed', 'failed', 'failed', 'failed', 'failed', 'failed', 'passed', 'passed']);
  assert.match(results[0].error, /First action fails/); assert.match(results[1].error, /Second setup fails/);
  assert.match(results[4].error, /Fifth check fails/); assert.match(results[5].error, /Sixth open fails/);
  assert.match(results[2].captureError, /Third capture fails/); assert.match(results[3].closeError, /Fourth cleanup fails/);
});
