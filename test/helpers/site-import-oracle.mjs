import assert from 'node:assert/strict';
import { BpmnModdle } from 'bpmn-moddle';
const oracle = new BpmnModdle();
const XSI = 'http://www.w3.org/2001/XMLSchema-instance';

/** Raw-file comparison only: the exporter may add the standard schema-instance declaration. */
export async function assertFileImportMatches(actualXML, fixtureXML) {
  const [actual, expected] = await Promise.all([oracle.fromXML(actualXML), oracle.fromXML(fixtureXML)]);
  assert.deepEqual(actual.warnings, []); assert.deepEqual(expected.warnings, []);
  // Original declarations, including opaque QName namespaces, must remain intact.
  for (const [key, value] of Object.entries(expected.rootElement.$attrs || {})) {
    if (key === 'xmlns' || key.startsWith('xmlns:')) assert.equal(actual.rootElement.$attrs[key], value, `preserve ${key}`);
  }
  for (const parsed of [actual, expected]) {
    const attrs = parsed.rootElement.$attrs;
    if (attrs['xmlns:xsi'] === undefined) attrs['xmlns:xsi'] = XSI;
  }
  // Add only the missing standard declaration; never delete or overwrite a binding.
  assert.equal((await oracle.toXML(actual.rootElement, { format: true })).xml,
    (await oracle.toXML(expected.rootElement, { format: true })).xml);
}
