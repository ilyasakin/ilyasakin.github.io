/** Actual validated Modeler API behind the site's import session; native UI is separate. */
import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import { readFile } from 'node:fs/promises';
import { BpmnModdle } from 'bpmn-moddle';
import { assertFileImportMatches } from './helpers/site-import-oracle.mjs';
import { DiagramImportSession } from '../app/demo/bpmn/modeler/diagram-import.ts';
import { setupDOM } from '../vendor/bpmn-xyflow/test/helpers/dom.mjs';

let dom, Modeler;
before(async () => { dom = await setupDOM(); ({ default: Modeler } = await dom.loadModule('/vendor/bpmn-xyflow/lib/Modeler.js')); });
after(async () => dom?.cleanup());
const samples = ['order-payment-delivery', 'approval-rejection-rework', 'booking-timeout-compensation'];
const input = async name => ({ xml: await readFile(`public/bpmn-samples/scenarios/${name}.bpmn`, 'utf8'), label: name, sample: null });
async function editor(name = samples[0]) {
  const m = new Modeler({ container: dom.createContainer(), fitViewOnInit: false });
  const session = new DiagramImportSession(m);
  assert.equal((await session.request(await input(name))).kind, 'loaded');
  return { m, session, close() { session.cancel(); m.destroy(); } };
}
async function snapshot(m) { return { xml: await m.getXML(), graph: m.getGraph(), selection: m.getSelection(), viewport: m.getViewport(), history: m.commandStack.snapshot() }; }
async function unchanged(m, before) {
  assert.equal(await m.getXML(), before.xml);
  assert.equal(m.getGraph(), before.graph);
  assert.deepEqual(m.getSelection(), before.selection);
  assert.deepEqual(m.getViewport(), before.viewport);
  assert.deepEqual(m.commandStack.snapshot(), before.history);
}
const oracle = new BpmnModdle();
async function canonical(xml) { const p = await oracle.fromXML(xml); assert.deepEqual(p.warnings, []); return (await oracle.toXML(p.rootElement, { format: true })).xml; }

test('three business diagrams export and reimport with complete semantics and DI, fresh history and selection', async () => {
  for (const name of samples) {
    const h = await editor(name), { m, session } = h;
    try {
      const exported = await m.getXML();
      await assertFileImportMatches(exported, (await input(name)).xml);
      const node = m.getGraph().nodes.find(node => node.type.endsWith('Task'));
      m.select(node.id);
      for (let i = 0; i < 2; i++) {
        const outcome = await session.request({ xml: exported, label: 'Exported XML', sample: null });
        assert.equal(outcome.kind, 'loaded');
        assert.deepEqual(outcome.result.warnings, []);
        assert.equal(await canonical(await m.getXML()), await canonical(exported));
        assert.deepEqual(m.getSelection(), []);
        assert.equal(m.canUndo(), false); assert.equal(m.canRedo(), false);
      }
      m.updateLabel(m.getElement(node.id), 'Fresh edit after import');
      assert.equal(m.canUndo(), true); m.undo();
      assert.equal(await canonical(await m.getXML()), await canonical(exported));
      assert.equal((await session.request({ xml: exported, label: "After Undo", sample: null })).kind, "loaded", "Undo back to baseline needs no replacement warning");
    } finally { h.close(); }
  }
});

test('replacement warns for complete-document edits, including a drilled child with no active root history', async () => {
  const h = await editor(), { m, session } = h;
  try {
    await m.drillInto(m.getElement('Payment'));
    m.updateLabel(m.getElement('CapturePayment'), 'Unsaved child payment');
    await m.navigateBack(); assert.equal(m.canUndo(), false);
    m.select('ValidateOrder'); const before = await snapshot(m);
    const next = await input(samples[1]);
    assert.equal((await session.request(next)).kind, 'confirmation'); await unchanged(m, before);
    session.cancel(); assert.equal((await session.confirm()).kind, 'cancelled'); await unchanged(m, before);
    assert.equal((await session.request(next)).kind, 'confirmation');
    assert.equal((await session.confirm()).kind, 'loaded');
    assert.equal(m.canNavigateBack(), false); assert.deepEqual(m.getSelection(), []);
    assert.equal(m.canUndo(), false); assert.equal(m.canRedo(), false);
    assert.ok(m.getElement('ReviewRequest')); assert.equal(m.getElement('CapturePayment'), null);
  } finally { h.close(); }
});

test('empty, malformed, DTD and invalid diagram imports preserve exact diagram, selection, viewport and both history directions', async () => {
  const h = await editor(), { m, session } = h;
  try {
    m.updateLabel(m.getElement('ValidateOrder'), 'Keep me');
    m.updateLabel(m.getElement('ValidateOrder'), 'Redo me'); m.undo(); m.select('ValidateOrder');
    const before = await snapshot(m);
    for (const xml of [' ', '<broken>', '<!DOCTYPE x [<!ENTITY x "boom">]><x/>', '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"/>']) {
      if (xml.trim()) {
        assert.equal((await session.request({ xml, label: 'Invalid', sample: null })).kind, 'confirmation');
        await assert.rejects(session.confirm());
      } else await assert.rejects(session.request({ xml, label: 'Empty', sample: null }));
      await unchanged(m, before);
    }
    m.redo(); assert.equal(m.getElement('ValidateOrder').businessObject.name, 'Redo me');
    m.undo(); await unchanged(m, before);
  } finally { h.close(); }
});

test('cancel and duplicate submissions cannot commit stale replacement requests', async () => {
  let current = 'baseline', imports = 0, release;
  const port = { async importXML(xml) { imports++; current = xml; return { warnings: [], graph: {} }; }, async getXML() { return current; } };
  const session = new DiagramImportSession(port);
  await session.request({ xml: current, label: 'Initial', sample: 0 });
  port.getXML = () => new Promise(resolve => { release = resolve; });
  const pending = session.request({ xml: 'new', label: 'New', sample: null });
  await assert.rejects(session.request({ xml: 'duplicate', label: 'Duplicate', sample: null }), /already loading/);
  session.cancel(); release('changed');
  assert.equal((await pending).kind, 'cancelled'); assert.equal(imports, 1); assert.equal(current, 'baseline');
  assert.equal((await session.confirm()).kind, 'cancelled');
});

test('embedded markup remains model text and opaque XML, never DOM content', async () => {
  const h = await editor(), { m, session } = h;
  try {
    const source = await input(samples[1]);
    source.xml = source.xml.replace('name="Review request"', 'name="&lt;img src=x onerror=alert(1)&gt;"');
    source.xml = source.xml.replace('<bpmn:process ', '<bpmn:process ').replace('<bpmn:laneSet', '<bpmn:extensionElements><v:payload xmlns:v="urn:site-import:test"><![CDATA[<script>window.importExecuted=true</script>]]></v:payload></bpmn:extensionElements><bpmn:laneSet');
    assert.equal((await session.request(source)).kind, 'loaded');
    assert.equal(window.importExecuted, undefined);
    assert.equal(m.getContainer().querySelector('script,img'), null);
    assert.match(await m.getXML(), /window.importExecuted/);
    await canonical(await m.getXML());
  } finally { h.close(); }
});
