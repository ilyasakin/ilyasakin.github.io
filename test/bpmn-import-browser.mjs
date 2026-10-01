/** Production import acceptance: only visible UI, native input, and exported XML observations. */
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { BpmnModdle } from 'bpmn-moddle';
const oracle = new BpmnModdle();
async function canonical(xml) {
  const parsed = await oracle.fromXML(xml);
  assert.deepEqual(parsed.warnings, [], 'independent BPMN parser accepts complete export');
  return (await oracle.toXML(parsed.rootElement, { format: true })).xml;
}

export async function verifyProductionImport(page, { clickButton, exportedDiagram, chooseSample }) {
  const results = [];
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
    return { xml, ...ui };
  };
  async function open(xml) {
    await clickButton('Import XML');
    await page.waitForSelector('dialog[open] textarea');
    if (xml !== undefined) {
      await page.click('#bpmn-import-xml');
      await page.keyboard.insertText(xml);
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

  // Three real business documents use both supported entry paths and a true exported-file round trip.
  for (const [index, name, id] of [[3, 'order-payment-delivery', 'ValidateOrder'], [4, 'approval-rejection-rework', 'ReviewRequest'], [5, 'booking-timeout-compensation', 'ReserveHotel']]) {
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
    assert.equal(await canonical((await current()).xml), await canonical(await readFile(fixturePath, 'utf8')));
    results.push({ case: `${name}: paste exported XML and load local BPMN file`, status: 'passed' });
  }
  const beforeFile = await current();
  await mkdir('test-artifacts', { recursive: true });
  const exportedPath = path.resolve('test-artifacts/site-export-roundtrip.xml');
  await writeFile(exportedPath, beforeFile.xml);
  await open(); await (await page.$('#bpmn-import-file')).uploadFile(exportedPath);
  await page.waitForFunction(() => document.querySelector('#bpmn-import-xml').value.includes('ReserveHotel'));
  await clickButton('Import diagram'); await ready();
  assert.equal(await canonical((await current()).xml), await canonical(beforeFile.xml));
  results.push({ case: 'production export to local .xml file to import', status: 'passed' });

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
  results.push({ case: 'unsaved guard, Cancel, Escape, malformed error, sample guard, accepted replacement and exact old undo/redo', status: 'passed' });

  const beforePicker = await current();
  await open('draft remains here');
  const picker = page.waitForFileChooser(); await page.click('#bpmn-import-file'); await (await picker).cancel();
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
  results.push({ case: 'file chooser cancellation, delayed read and unsupported file keep draft, focus and exact diagram', status: 'passed' });

  // Imported text and opaque extension XML must never become executable browser markup.
  let inert = await readFile('public/bpmn-samples/scenarios/approval-rejection-rework.bpmn', 'utf8');
  inert = inert.replace('name="Review request"', 'name="&lt;img src=x onerror=window.siteImportExecuted=true&gt;"')
    .replace('<bpmn:laneSet', '<bpmn:extensionElements><v:payload xmlns:v="urn:site-import:test"><![CDATA[<script>window.siteImportExecuted=true</script>]]></v:payload></bpmn:extensionElements><bpmn:laneSet');
  assert.match(inert, /siteImportExecuted/);
  await importPaste(inert);
  assert.equal(await page.evaluate(() => window.siteImportExecuted), undefined);
  assert.equal(await page.$eval('.bpmn-xyflow-viewport', e => e.querySelector('script,img,foreignObject')), null);
  assert.match((await current()).xml, /siteImportExecuted/);
  results.push({ case: 'embedded markup stays inert through input, render and export', status: 'passed' });

  await page.setViewport({ width: 390, height: 844 });
  await open();
  assert.ok(await page.$eval('dialog[open]', e => {
    const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight;
  }));
  await page.screenshot({ path: 'test-artifacts/site-import-phone.png', fullPage: true });
  await page.keyboard.press('Escape'); await ready();
  await page.setViewport({ width: 1188, height: 762 });
  results.push({ case: 'phone dialog remains visible and Escape dismisses it', status: 'passed' });
  await writeFile('test-artifacts/site-import-results.json', JSON.stringify(results, null, 2));
  assert.equal(results.length, 8);
  console.log('PASS production Import XML: 8 groups, 3 business diagrams, full-model round trips, exact failure/cancel/history and inert content');
}
