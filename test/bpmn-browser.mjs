/** Run against a built/local or explicitly approved hosted site preview. */
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { verifyProductionImport } from './bpmn-import-browser.mjs';

const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
if (!executablePath) throw new Error('PUPPETEER_EXECUTABLE_PATH must identify supported sandbox-capable Chrome');
const port = 5331;
const base = process.env.SITE_BASE_URL || `http://127.0.0.1:${port}`;
const server = process.env.SITE_BASE_URL ? null : spawn(process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '--port', String(port), '--hostname', '127.0.0.1'],
  { stdio: ['ignore', 'pipe', 'inherit'] });
server?.stdout.on('data', () => {});
let browser, page;
try {
  const deadline = Date.now() + 60000;
  while (true) {
    try { if ((await fetch(new URL('/demo/bpmn', base), { signal: AbortSignal.timeout(5000) })).ok) break; } catch { /* server startup */ }
    if ((server && server.exitCode !== null) || Date.now() > deadline) throw new Error('Production Next server startup timed out');
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  browser = await puppeteer.launch({ headless: true, executablePath });
  page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({width:1188,height:762});
  await page.goto(new URL('/demo/bpmn', base).href, {waitUntil:'networkidle0'});
  await page.waitForSelector('[data-element-id="Task_1"]');
  assert.ok(await page.$eval('[data-element-id="Task_1"]', el => el.getBoundingClientRect().width >= 100));
  assert.equal(await page.$eval('strong', el => getComputedStyle(el).color), 'rgb(31, 41, 55)');
  assert.equal((await page.$$('.bjs-powered-by')).length,1);

  await page.type('input[aria-label="Find by name or ID"]','Task_1');
  await page.click('button[type="submit"]');
  await page.waitForSelector('[data-element-id="Task_1"].is-selected');
  await page.click('a[href="/demo/bpmn/modeler"]');
  await page.waitForSelector('.bpmn-xyflow-palette');
  await chooseSample('1');
  await page.waitForSelector('[data-element-id="Task_1"]');
  const unobstructed = await page.evaluate(() => {
    const obstacles = [...document.querySelectorAll('.bpmn-xyflow-palette, .bpmn-xyflow-editor-actions, .bpmn-xyflow-minimap, .bjs-powered-by')].map(element => element.getBoundingClientRect());
    return [...document.querySelectorAll('.bpmn-xyflow-shape')].every(element => {
      const rect = element.getBoundingClientRect();
      return obstacles.every(other => rect.right <= other.left || rect.left >= other.right || rect.bottom <= other.top || rect.top >= other.bottom);
    });
  });
  assert.ok(unobstructed, 'automatic fit keeps the Basic diagram clear of all editor chrome');
  await page.click('[data-element-id="Task_1"]');
  const textColor = await page.$eval('.bpmn-xyflow-context-pad button', el => getComputedStyle(el).color);
  assert.equal(textColor,'rgb(34, 36, 42)');
  assert.equal((await page.$$('.bjs-powered-by')).length,1);

  // Export remains dismissible across repeated use, without duplicate UI.
  for (let repeat=0; repeat<2; repeat++) {
    const buttons = await page.$$('button');
    const exportButton = await Promise.all(buttons.map(async button => ({button,text:await button.evaluate(el=>el.textContent)})));
    await exportButton.find(item => item.text === 'Export XML').button.click();
    await page.waitForSelector('pre');
    assert.match(await page.$eval('pre',el=>el.textContent), /definitions/);
    await page.click('[aria-label="Close XML export"]');
    await page.waitForSelector('pre',{hidden:true});
  }
  // User-reported basic bug: a visible right-side port must not flip to the
  // left side when the chosen target is left of the source. Use only public UI,
  // SVG screen transforms and the Export XML dialog, never an editor API.
  async function clickButton(text) {
    for (const button of await page.$$('button')) {
      if ((await button.evaluate(node => node.textContent)).trim() === text) {
        await button.click(); return;
      }
    }
    throw new Error(`Missing button ${text}`);
  }
  async function chooseSample(index) {
    await page.waitForFunction(() => !document.querySelector('select[aria-label="Sample diagram"]').disabled);
    const label = await page.$eval('select[aria-label="Sample diagram"]', (select, index) => select.querySelector(`option[value="${index}"]`).textContent, index);
    await page.select('select[aria-label="Sample diagram"]', index);
    await page.waitForFunction(({ index, label }) =>
      document.querySelector('#import-title')?.textContent === 'Replace unsaved changes?' ||
      (document.querySelector('select[aria-label="Sample diagram"]').value === index && document.querySelector('[role="status"]')?.textContent.startsWith(`Loaded ${label}`)), {}, { index, label });
    if (await page.$('dialog[open]')) await clickButton('Replace diagram');
    await page.waitForFunction(({ index, label }) => !document.querySelector('dialog[open]') &&
      document.querySelector('select[aria-label="Sample diagram"]').value === index && document.querySelector('[role="status"]')?.textContent.startsWith(`Loaded ${label}`), {}, { index, label });
  }
  async function exportedDiagram() {
    await clickButton('Export XML'); await page.waitForSelector('pre');
    const result = await page.$eval('pre', node => {
      const xml = node.textContent, doc = new DOMParser().parseFromString(xml, 'application/xml');
      if (doc.querySelector('parsererror')) throw new Error('Invalid exported BPMN XML');
      const all = [...doc.getElementsByTagName('*')];
      const ids = Object.fromEntries(all.filter(e => e.hasAttribute('name')).map(e => [e.getAttribute('name'), e.getAttribute('id')]));
      const bounds = Object.fromEntries(all.filter(e => e.localName === 'BPMNShape').map(e => {
        const b = [...e.children].find(child => child.localName === 'Bounds');
        return [e.getAttribute('bpmnElement'), Object.fromEntries(['x', 'y', 'width', 'height'].map(k => [k, Number(b.getAttribute(k))]))];
      }));
      const flows = all.filter(e => e.localName === 'sequenceFlow').map(e => {
        const di = all.find(d => d.localName === 'BPMNEdge' && d.getAttribute('bpmnElement') === e.id);
        return { id: e.id, source: e.getAttribute('sourceRef'), target: e.getAttribute('targetRef'), points: di ? [...di.children].filter(p => p.localName === 'waypoint').map(p => ({ x: Number(p.getAttribute('x')), y: Number(p.getAttribute('y')) })) : [] };
      });
      return { xml, ids, bounds, flows };
    });
    await page.click('[aria-label="Close XML export"]');
    await page.waitForSelector('pre', { hidden: true });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    return result;
  }
  await chooseSample('2');
  await page.waitForSelector('[data-element-id="sid-F08DF3C0-AC64-4563-A5AE-E5E807602626"]');
  const beforeArrow = await exportedDiagram(), sourceId = beforeArrow.ids['T2.0'], targetId = beforeArrow.ids.T1;
  assert.ok(sourceId && targetId);
  const sourceBounds = beforeArrow.bounds[sourceId], targetBounds = beforeArrow.bounds[targetId];
  const sourcePort = { x: sourceBounds.x + sourceBounds.width, y: sourceBounds.y + sourceBounds.height / 2 };
  const targetPort = { x: targetBounds.x + targetBounds.width, y: targetBounds.y + targetBounds.height * 0.75 };
  const screenPoint = point => page.evaluate(point => {
    const matrix = document.querySelector('.bpmn-xyflow-viewport').getScreenCTM();
    const p = new DOMPoint(point.x, point.y).matrixTransform(matrix); return { x: p.x, y: p.y, zoom: Math.hypot(matrix.a, matrix.b) };
  }, point);
  const sourceCenter = await screenPoint({ x: sourceBounds.x + sourceBounds.width / 2, y: sourceBounds.y + sourceBounds.height / 2 });
  await page.mouse.move(sourceCenter.x, sourceCenter.y);
  const portHandle = await page.waitForSelector('.bpmn-xyflow-connect-handle');
  const handleBounds = await portHandle.boundingBox(), targetScreen = await screenPoint(targetPort);
  await page.mouse.move(handleBounds.x + handleBounds.width / 2, handleBounds.y + handleBounds.height / 2);
  await page.mouse.down(); await page.mouse.move(targetScreen.x, targetScreen.y, { steps: 12 });
  const live = await page.$eval('.bpmn-xyflow-connect-preview path', path => {
    const start = path.getPointAtLength(0), end = path.getPointAtLength(path.getTotalLength());
    return { start: { x: start.x, y: start.y }, end: { x: end.x, y: end.y } };
  });
  await mkdir('test-artifacts', { recursive: true });
  await page.screenshot({ path: 'test-artifacts/site-bpmn-arrow-preview.png', fullPage: true });
  await page.mouse.up();
  const afterArrow = await exportedDiagram();
  const newArrow = afterArrow.flows.find(flow => !beforeArrow.flows.some(old => old.id === flow.id) && flow.source === sourceId && flow.target === targetId);
  assert.ok(newArrow, 'visible port drag creates a semantic flow');
  const near = (actual, expected, label) => assert.ok(Math.hypot(actual.x - expected.x, actual.y - expected.y) <= 1.5 / targetScreen.zoom, `${label}: ${JSON.stringify({ actual, expected })}`);
  near(live.start, sourcePort, 'production preview keeps chosen RIGHT source port');
  near(live.end, targetPort, 'production preview keeps chosen target port');
  near(newArrow.points[0], sourcePort, 'production export keeps chosen RIGHT source port');
  near(newArrow.points.at(-1), targetPort, 'production export keeps chosen target port');
  await clickButton('Undo'); assert.equal((await exportedDiagram()).xml, beforeArrow.xml, 'production Undo restores exact diagram');
  await clickButton('Redo'); assert.equal((await exportedDiagram()).xml, afterArrow.xml, 'production Redo restores exact arrow');
  // The real sample's visually horizontal edge has fractional ordinates.
  // Native segment dragging must not mistake it for a free-form diagonal.
  const fractionalId = 'sid-262FECFE-432B-42B6-AAF7-040A6B6D1880';
  const fractionalBefore = afterArrow.flows.find(flow => flow.id === fractionalId);
  assert.ok(fractionalBefore && fractionalBefore.points.length === 2);
  const middle = await screenPoint({
    x: (fractionalBefore.points[0].x + fractionalBefore.points[1].x) / 2,
    y: (fractionalBefore.points[0].y + fractionalBefore.points[1].y) / 2,
  });
  await page.mouse.click(middle.x, middle.y);
  await page.mouse.move(middle.x, middle.y); await page.mouse.down();
  await page.mouse.move(middle.x, middle.y + 55, { steps: 10 }); await page.mouse.up();
  const afterSegment = await exportedDiagram(), fractionalAfter = afterSegment.flows.find(flow => flow.id === fractionalId);
  assert.equal(fractionalAfter.source, fractionalBefore.source); assert.equal(fractionalAfter.target, fractionalBefore.target);
  assert.ok(fractionalAfter.points.length >= 4, 'fractional segment drag creates an orthogonal dogleg');
  assert.ok(fractionalAfter.points.every((point, index, points) => index === 0 || Math.abs(point.x - points[index - 1].x) < 0.01 || Math.abs(point.y - points[index - 1].y) < 0.01), 'fractional segment must not turn into a V');
  await page.screenshot({ path: 'test-artifacts/site-bpmn-fractional-segment.png', fullPage: true });
  await clickButton('Undo'); assert.equal((await exportedDiagram()).xml, afterArrow.xml, 'fractional segment Undo preserves exact original decimals');
  await clickButton('Redo'); assert.equal((await exportedDiagram()).xml, afterSegment.xml, 'fractional segment Redo restores exact edited route');

  await chooseSample('1');
  await page.waitForSelector('[data-element-id="Task_1"]');

  await page.click('.bpmn-xyflow-palette button:nth-child(2)');
  assert.ok((await page.$$('.bpmn-xyflow-shape')).length >= 3);
  for (const index of ['3','4','5','6']) {
    await chooseSample(index);
    await page.waitForFunction(index => {
      const select = document.querySelector('select[aria-label="Sample diagram"]');
      const label = select.options[Number(index)].text;
      return [...document.querySelectorAll('span')].some(element => element.textContent.startsWith(`Loaded ${label}`));
    }, {}, index);
    assert.ok((await page.$$('.bpmn-xyflow-shape')).length > 5);
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent === 'Undo').disabled), true);
    await page.click('.bpmn-xyflow-palette button:nth-child(2)');
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent === 'Undo').disabled), false);
  }
  await page.click('a[href="/demo/bpmn"]');
  await page.waitForSelector('[data-element-id="Task_1"]');
  assert.equal((await page.$$('.bjs-powered-by')).length,1);
  assert.equal((await page.$$('.bpmn-xyflow-palette')).length,0);

  // Phone layout must keep attribution within its canvas and controls usable.
  await page.setViewport({width:390,height:844});
  await page.reload({waitUntil:'networkidle0'});
  await page.waitForSelector('.bjs-powered-by');
  const fits = await page.$eval('.bjs-powered-by', el => {
    const rect=el.getBoundingClientRect();
    return rect.left>=0 && rect.right<=innerWidth && rect.top>=0 && rect.bottom<=innerHeight;
  });
  assert.ok(fits);
  assert.deepEqual(errors,[]);
  await mkdir('test-artifacts', { recursive: true });
  await page.screenshot({ path: 'test-artifacts/site-bpmn-phone.png', fullPage: true });
  await verifyProductionImport(browser, base);
  console.log('PASS site browser parity: readable fit/header/controls, search, navigation teardown, repeated XML export/close, palette, precise native arrow anchors/history, phone attribution');
} catch (error) {
  await mkdir('test-artifacts', { recursive: true });
  await page?.screenshot({ path: 'test-artifacts/site-bpmn-failure.png', fullPage: true });
  throw error;
} finally { await browser?.close(); server?.kill('SIGTERM'); }

