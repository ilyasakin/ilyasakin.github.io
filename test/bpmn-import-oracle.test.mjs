import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { BpmnModdle } from 'bpmn-moddle';
import { assertFileImportMatches } from './helpers/site-import-oracle.mjs';
const fixture = await readFile('public/bpmn-samples/scenarios/order-payment-delivery.bpmn', 'utf8');
const withXsi = xml => xml.replace('xmlns:di="http://www.omg.org/spec/DD/20100524/DI"', 'xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');

test('raw fixture and independent export differ only by the added standard schema-instance declaration', async () => {
  const m = new BpmnModdle(), parsed = await m.fromXML(fixture);
  assert.deepEqual(parsed.warnings, []); assert.equal(parsed.rootElement.$attrs['xmlns:xsi'], undefined);
  parsed.rootElement.$attrs['xmlns:xsi'] = 'http://www.w3.org/2001/XMLSchema-instance';
  const exported = (await m.toXML(parsed.rootElement, { format: true })).xml;
  await assertFileImportMatches(exported, fixture);
  await assertFileImportMatches(fixture, fixture);
  await assert.rejects(assertFileImportMatches(exported.replace('http://www.w3.org/2001/XMLSchema-instance', 'urn:wrong-xsi'), fixture));
});

test('file-import oracle preserves other namespaces, QName metadata, IDs, references, text and exact DI', async () => {
  const rich = fixture.replace('<bpmn:definitions ', '<bpmn:definitions xmlns:keep="urn:site:keep" ')
    .replace('<bpmn:startEvent', '<bpmn:extensionElements><keep:record type="keep:Kind">Keep all content</keep:record></bpmn:extensionElements><bpmn:startEvent');
  const actual = withXsi(rich); await assertFileImportMatches(actual, rich);
  const corruptions = [
    value => value.replace('urn:site:keep', 'urn:changed'),
    value => value.replace(' xmlns:keep="urn:site:keep"', ''),
    value => value.replace('keep:Kind', 'keep:Wrong'),
    value => value.replace('Keep all content', 'Lost content'),
    value => value.replace('id="BuyerFlow1"', 'id="ChangedFlow"'),
    value => value.replace('sourceRef="BuyerStart"', 'sourceRef="SubmitOrder"'),
    value => value.replace('name="Need product"', 'name="Changed name"'),
    value => value.replace(/(<dc:Bounds\s+x=")[^"]+/, (_, prefix) => `${prefix}12345`),
  ];
  for (const corrupt of corruptions) {
    const changed = corrupt(actual); assert.notEqual(changed, actual);
    await assert.rejects(assertFileImportMatches(changed, rich));
  }
});
