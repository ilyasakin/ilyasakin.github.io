/** Run against a built/local or explicitly approved hosted site preview. */
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

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
  await page.select('select[aria-label="Sample diagram"]','1');
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
  await page.click('.bpmn-xyflow-palette button:nth-child(2)');
  assert.ok((await page.$$('.bpmn-xyflow-shape')).length >= 3);
  for (const index of ['3','4','5','6']) {
    await page.select('select[aria-label="Sample diagram"]', index);
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
  console.log('PASS site browser parity: readable fit/header/controls, search, navigation teardown, repeated XML export/close, palette, phone attribution');
} catch (error) {
  await mkdir('test-artifacts', { recursive: true });
  await page?.screenshot({ path: 'test-artifacts/site-bpmn-failure.png', fullPage: true });
  throw error;
} finally { await browser?.close(); server?.kill('SIGTERM'); }

