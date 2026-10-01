/** Production import acceptance: only visible UI, native input, and exported XML observations. */
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { BpmnModdle } from 'bpmn-moddle';
import { assertFileImportMatches } from './helpers/site-import-oracle.mjs';
const oracle = new BpmnModdle();
async function canonical(xml) {
  const parsed = await oracle.fromXML(xml);
  assert.deepEqual(parsed.warnings, [], 'independent BPMN parser accepts complete export');
  return (await oracle.toXML(parsed.rootElement, { format: true })).xml;
}

/** Use the installed Puppeteer native CDP text-input API, with no DOM value assignment. */
export async function enterXML(page, xml) {
  await page.click('#bpmn-import-xml');
  await page.evaluate(() => {
    const input = document.querySelector('#bpmn-import-xml');
    if (input.value !== '') throw new Error('Paste case requires an empty visible textarea');
    const events = [];
    const listener = event => { events.push({ trusted: event.isTrusted, type: event.inputType, value: input.value }); };
    input.addEventListener('input', listener);
    window.sitePasteObservation = { events, remove: () => input.removeEventListener('input', listener) };
  });
  try {
    await page.keyboard.sendCharacter(xml);
    const observed = await page.evaluate(() => ({ value: document.querySelector('#bpmn-import-xml').value, events: window.sitePasteObservation.events }));
    assert.equal(observed.value, xml, 'native text insertion preserves complete XML');
    assert.ok(observed.events.length > 0, 'native text insertion fires input');
    assert.ok(observed.events.every(event => event.trusted), 'input events originate from Chrome');
    assert.equal(observed.events.at(-1).value, xml);
  } finally {
    await page.evaluate(() => { window.sitePasteObservation?.remove(); delete window.sitePasteObservation; });
  }
}

/** Every group gets its own lifecycle and reports a result, even after another group fails. */
export async function runImportGroups(cases, openCase, report = async () => {}) {
  const results = [];
  for (const group of cases) {
    let context;
    const result = { id: group.id, case: group.name, status: 'passed' };
    try {
      context = await openCase(group);
      await context.setup?.();
      await group.run(context);
      await context.check?.();
    } catch (error) {
      result.status = 'failed'; result.error = error.stack || String(error);
    } finally {
      if (context) {
        try { await context.capture?.(result); } catch (error) {
          result.status = 'failed'; result.captureError = error.stack || String(error);
        }
        try { await context.close(); } catch (error) {
          result.status = 'failed'; result.closeError = error.stack || String(error);
        }
      }
    }
    results.push(result);
    await report(results);
  }
  return results;
}

function importControls(page) {
  let lastXML = null;
  async function clickButton(text) {
    for (const button of await page.$$('button')) {
      if ((await button.evaluate(node => node.textContent)).trim() === text) { await button.click(); return; }
    }
    throw new Error(`Missing button ${text}`);
  }
  async function exportedDiagram() {
    await clickButton('Export XML'); await page.waitForSelector('pre');
    const xml = await page.$eval('pre', node => node.textContent);
    await page.click('[aria-label="Close XML export"]');
    await page.waitForSelector('pre', { hidden: true });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    return { xml };
  }
  async function chooseSample(index) {
    await page.waitForFunction(() => !document.querySelector('select[aria-label="Sample diagram"]').disabled);
    const label = await page.$eval('select[aria-label="Sample diagram"]', (select, index) => select.querySelector(`option[value="${index}"]`).textContent, index);
    await page.select('select[aria-label="Sample diagram"]', index);
    await page.waitForFunction(({ index, label }) => !document.querySelector('dialog[open]') &&
      document.querySelector('select[aria-label="Sample diagram"]').value === index && document.querySelector('[role="status"]')?.textContent.startsWith(`Loaded ${label}`), {}, { index, label });
  }
  const ready = () => page.waitForSelector('dialog[open]', { hidden: true });
  const warning = async () => {
    await page.waitForFunction(() => document.querySelector('#import-title')?.textContent === 'Replace unsaved changes?');
    await page.waitForFunction(() => document.activeElement?.textContent === 'Cancel');
  };
  const restoredFocus = () => page.waitForFunction(() => document.activeElement?.textContent === 'Import XML');
  const current = async () => {
    const { xml } = await exportedDiagram();
    const ui = await page.evaluate(() => ({
      selected: [...new Set([...document.querySelectorAll('[data-element-id].is-selected')].map(e => e.dataset.elementId))].sort(),
      transform: document.querySelector('.bpmn-xyflow-viewport').getAttribute('transform'),
      undo: ![...document.querySelectorAll('button')].find(e => e.textContent === 'Undo').disabled,
      redo: ![...document.querySelectorAll('button')].find(e => e.textContent === 'Redo').disabled,
    }));
    lastXML = xml;
    return { xml, ...ui };
  };
  async function open(xml) {
    await clickButton('Import XML');
    await page.waitForSelector('dialog[open] textarea');
    if (xml !== undefined) {
      await enterXML(page, xml);
    }
  }
  async function importPaste(xml) {
    await open(xml); await clickButton('Import diagram'); await ready();
  }
  async function cleanHistory() {
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('button')].find(e => e.textContent === 'Undo').disabled), true);
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('button')].find(e => e.textContent === 'Redo').disabled), true);
    assert.equal((await page.$$('[data-element-id].is-selected')).length, 0);
  }

  return { page, clickButton, exportedDiagram, chooseSample, ready, warning, restoredFocus, current, open, importPaste, cleanHistory, lastXML: () => lastXML };
}

export function productionImportCases() {
  const cases = [];
  for (const [index, name, id] of [[3, 'order-payment-delivery', 'ValidateOrder'], [4, 'approval-rejection-rework', 'ReviewRequest'], [5, 'booking-timeout-compensation', 'ReserveHotel']]) {
    cases.push({ id: name, name: `${name}: paste exported XML and load local BPMN file`, async run({ page, chooseSample, current, importPaste, cleanHistory, open, clickButton, ready }) {
    await chooseSample(String(index));
    const before = await current();
    await page.click(`[data-element-id="${id}"]`);
    assert.ok((await page.$$('[data-element-id].is-selected')).length > 0, "fixture selection is active before replacement");
    await importPaste(before.xml);
    await cleanHistory();
    assert.equal(await canonical((await current()).xml), await canonical(before.xml));
    const fixturePath = path.resolve(`public/bpmn-samples/scenarios/${name}.bpmn`);
    await open();
    await (await page.$('#bpmn-import-file')).uploadFile(fixturePath);
    await page.waitForFunction(id => document.querySelector('#bpmn-import-xml').value.includes(id), {}, id);
    await clickButton('Import diagram'); await ready(); await cleanHistory();
    await assertFileImportMatches((await current()).xml, await readFile(fixturePath, 'utf8'));

    } });
  }
  cases.push({ id: 'export-file', name: 'production export to local .xml file to import', async run({ page, chooseSample, current, open, clickButton, ready }) {
    await chooseSample('5');
  const beforeFile = await current();
  await mkdir('test-artifacts', { recursive: true });
  const exportedPath = path.resolve('test-artifacts/site-export-roundtrip.xml');
  await writeFile(exportedPath, beforeFile.xml);
  await open(); await (await page.$('#bpmn-import-file')).uploadFile(exportedPath);
  await page.waitForFunction(() => document.querySelector('#bpmn-import-xml').value.includes('ReserveHotel'));
  await clickButton('Import diagram'); await ready();
  assert.equal(await canonical((await current()).xml), await canonical(beforeFile.xml));

  } });
  cases.push({ id: 'unsaved-failure-history', name: 'unsaved guard, Cancel, Escape, malformed error, sample guard, accepted replacement and exact old undo/redo', async run({ page, chooseSample, current, open, clickButton, ready, warning, restoredFocus, cleanHistory }) {
    await chooseSample('5');
  const beforeFile = await current();
  // Build undo and redo directions with real palette and toolbar actions.
  const original = await current();
  await page.click('.bpmn-xyflow-palette button:nth-child(2)');
  await page.click('.bpmn-xyflow-palette button:nth-child(2)');
  await clickButton('Undo');
  await page.click('[data-element-id="ReserveHotel"]');
  const edited = await current();
  assert.ok(edited.selected.length > 0, 'failed/cancelled imports preserve a real active selection');
  assert.notEqual(edited.xml, original.xml); assert.ok(edited.undo && edited.redo);
  await open('<broken>'); await clickButton('Import diagram');
  await warning();
  assert.match(await page.$eval('#import-description', e => e.textContent), /undo history/);
  await clickButton('Cancel'); await ready(); await restoredFocus(); assert.deepEqual(await current(), edited);
  // Escape from the warning and the initial dialog are separate cancellation paths.
  await open('<broken>'); await clickButton('Import diagram');
  await warning();
  await page.keyboard.press('Escape'); await ready(); await restoredFocus(); assert.deepEqual(await current(), edited);
  await open('discard this draft'); await page.keyboard.press('Escape'); await ready(); await restoredFocus(); assert.deepEqual(await current(), edited);
  // Confirming invalid XML shows an accessible error and keeps the current document and both history directions.
  await open('<broken>'); await clickButton('Import diagram'); await warning(); await clickButton('Replace diagram');
  await page.waitForSelector('#import-error[role="alert"]');
  assert.ok(await page.$eval('#import-error', e => e.textContent.length > 0));
  assert.equal(await page.$eval('#bpmn-import-xml', e => e.getAttribute('aria-invalid')), 'true');
  await clickButton('Cancel'); await ready(); await restoredFocus(); assert.deepEqual(await current(), edited);
  await clickButton('Undo'); assert.equal((await current()).xml, original.xml);
  await clickButton('Redo'); assert.equal((await current()).xml, edited.xml);
  // Existing sample replacement uses the same explicit guard.
  await page.select('select[aria-label="Sample diagram"]', '4');
  await warning();
  await clickButton('Cancel'); await ready();
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Sample diagram');
  assert.equal((await current()).xml, edited.xml);
  // Accepted replacement resets old selection/history, and repeat import stays usable.
  await open(beforeFile.xml); await clickButton('Import diagram'); await warning(); await clickButton('Replace diagram'); await ready(); await cleanHistory();
  assert.equal(await canonical((await current()).xml), await canonical(beforeFile.xml));

  } });
  cases.push({ id: 'file-cancellation', name: 'file chooser cancellation, delayed read and unsupported file keep draft, focus and exact diagram', async run({ page, chooseSample, current, open, clickButton, ready, restoredFocus }) {
    await chooseSample('5');
  const beforePicker = await current();
  await open('draft remains here');
  await page.evaluate(() => {
    const input = document.querySelector('#bpmn-import-file'), events = [];
    const listener = event => { events.push({ target: event.target.id, bubbles: event.bubbles, cancelable: event.cancelable, trusted: event.isTrusted }); };
    input.addEventListener('cancel', listener);
    window.siteFileCancelObservation = { events, remove: () => input.removeEventListener('cancel', listener) };
  });
  try {
    const picker = page.waitForFileChooser(); await page.click('#bpmn-import-file'); await (await picker).cancel();
    // Installed Puppeteer emits this synthetic bubbling event; real picker input still performs the action.
    assert.deepEqual(await page.evaluate(() => window.siteFileCancelObservation.events), [
      { target: 'bpmn-import-file', bubbles: true, cancelable: false, trusted: false },
    ]);
    assert.equal((await page.$$('dialog[open]')).length, 1, 'cancelling the file picker keeps the import dialog open');
  } finally {
    await page.evaluate(() => { window.siteFileCancelObservation?.remove(); delete window.siteFileCancelObservation; });
  }
  assert.equal(await page.$eval('#bpmn-import-xml', e => e.value), 'draft remains here');
  await (await page.$('#bpmn-import-file')).uploadFile(path.resolve('README.md'));
  await page.waitForSelector('#import-error[role="alert"]');
  assert.equal(await page.$eval('dialog button[type="submit"]', e => e.disabled), true);
  assert.equal(await page.$eval('#bpmn-import-xml', e => e.value), 'draft remains here');
  await clickButton('Cancel'); await ready();
  await restoredFocus(); assert.deepEqual(await current(), beforePicker);

  // Delay only the selected file's native read promise, never the model/import APIs.
  const delayedPath = path.resolve('test-artifacts/site-delayed.bpmn');
  await writeFile(delayedPath, beforePicker.xml);
  await page.evaluate(() => {
    const original = File.prototype.text;
    window.restoreSiteFileRead = () => { File.prototype.text = original; delete window.releaseSiteFileRead; delete window.siteFileReadStarted; delete window.siteFileReadReleased; };
    File.prototype.text = function() {
      if (this.name !== 'site-delayed.bpmn') return original.call(this);
      const text = original.call(this);
      window.siteFileReadStarted = true;
      return new Promise((resolve, reject) => {
        window.releaseSiteFileRead = async () => { try { resolve(await text); } catch (error) { reject(error); } finally { window.siteFileReadReleased = true; } };
      });
    };
  });
  try {
    await open(); await (await page.$('#bpmn-import-file')).uploadFile(delayedPath);
    await page.waitForFunction(() => window.siteFileReadStarted === true);
    assert.equal(await page.$eval('dialog button[type="submit"]', e => e.textContent.trim()), 'Reading file…');
    await clickButton('Cancel'); await ready(); await restoredFocus();
    assert.deepEqual(await current(), beforePicker);
    await open(); assert.equal(await page.$eval('#bpmn-import-xml', e => e.value), '');
    await page.evaluate(() => window.releaseSiteFileRead());
    await page.waitForFunction(() => window.siteFileReadReleased === true);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.$eval('#bpmn-import-xml', e => e.value), '', 'late file read cannot populate a reopened dialog');
    await clickButton('Cancel'); await ready(); await restoredFocus();
    assert.deepEqual(await current(), beforePicker);
  } finally { await page.evaluate(() => { window.restoreSiteFileRead?.(); delete window.restoreSiteFileRead; }); }

  } });
  cases.push({ id: 'inert-content', name: 'embedded markup stays inert through input, render and export', async run({ page, chooseSample, importPaste, current }) {
    await chooseSample('4');
  // Imported text and opaque extension XML must never become executable browser markup.
  let inert = await readFile('public/bpmn-samples/scenarios/approval-rejection-rework.bpmn', 'utf8');
  inert = inert.replace('name="Review request"', 'name="&lt;img src=x onerror=window.siteImportExecuted=true&gt;"')
    .replace('<bpmn:laneSet', '<bpmn:extensionElements><v:payload xmlns:v="urn:site-import:test"><![CDATA[<script>window.siteImportExecuted=true</script>]]></v:payload></bpmn:extensionElements><bpmn:laneSet');
  assert.match(inert, /siteImportExecuted/);
  await importPaste(inert);
  assert.equal(await page.evaluate(() => window.siteImportExecuted), undefined);
  assert.equal(await page.$eval('.bpmn-xyflow-viewport', e => e.querySelector('script,img,foreignObject')), null);
  assert.match((await current()).xml, /siteImportExecuted/);

  } });
  cases.push({ id: 'phone-dialog', name: 'phone dialog remains visible and Escape dismisses it', async run({ page, chooseSample, open, ready }) {
    await chooseSample('5');
  await page.setViewport({ width: 390, height: 844 });
  await open();
  assert.ok(await page.$eval('dialog[open]', e => {
    const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight;
  }));
  await page.screenshot({ path: 'test-artifacts/site-import-phone.png', fullPage: true });
  await page.keyboard.press('Escape'); await ready();
  await page.setViewport({ width: 1188, height: 762 });

  } });
  return cases;
}

export async function verifyProductionImport(browser, base) {
  await mkdir('test-artifacts', { recursive: true });
  const cases = productionImportCases();
  assert.equal(cases.length, 8);
  const results = await runImportGroups(cases, async group => {
    const page = await browser.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(30000);
    const controls = importControls(page);
    return {
      ...controls,
      async setup() {
        await page.setViewport({ width: 1188, height: 762 });
        await page.goto(new URL('/demo/bpmn/modeler', base).href, { waitUntil: 'networkidle0' });
        await page.waitForSelector('.bpmn-xyflow-palette');
        await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent === 'Import XML' && !button.disabled));
      },
      async check() { assert.deepEqual(errors, [], 'no page errors during import'); },
      async capture(result) {
        const prefix = `test-artifacts/site-import-${group.id}`;
        const ui = await page.evaluate(() => ({ url: location.href, status: document.querySelector('[role="status"]')?.textContent,
          dialog: document.querySelector('dialog[open]')?.textContent, focus: document.activeElement?.outerHTML,
          selection: [...document.querySelectorAll('[data-element-id].is-selected')].map(node => node.dataset.elementId) }));
        await writeFile(`${prefix}.json`, JSON.stringify({ ...result, errors, ui, lastExportedXML: controls.lastXML() }, null, 2));
        await page.screenshot({ path: `${prefix}.png`, fullPage: true });
      },
      async close() { await page.close(); },
    };
  }, async results => {
    await writeFile('test-artifacts/site-import-results.json', JSON.stringify(results, null, 2));
    const last = results.at(-1); console.log(`${last.status === 'passed' ? 'PASS' : 'FAIL'} import ${last.id}${last.error ? ': ' + last.error : ''}`);
  });
  assert.equal(results.length, 8);
  const failures = results.filter(result => result.status !== 'passed');
  assert.deepEqual(failures, [], `${failures.length}/8 production import groups failed; all groups ran independently`);
  console.log('PASS production Import XML: 8 independent groups, 3 business diagrams, full-model round trips, exact failure/cancel/history and inert content');
}
