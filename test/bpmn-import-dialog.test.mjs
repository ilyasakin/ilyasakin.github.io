/** Actual React dialog event handlers in a structural DOM; hosted tests own native picker/Escape evidence. */
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { Window } from 'happy-dom';
import { createServer } from 'vite';
import { FileChooser } from 'puppeteer-core/internal/common/FileChooser.js';
let window, vite, React, createRoot, ImportDialog;
before(async () => {
  window = new Window();
  for (const key of ['window', 'document', 'HTMLElement', 'HTMLDialogElement', 'Event', 'navigator']) Object.defineProperty(globalThis, key, { configurable: true, value: key === 'window' ? window : window[key] });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  React = await import('react'); ({ createRoot } = await import('react-dom/client'));
  vite = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false, ws: false }, esbuild: { jsx: 'automatic' }, ssr: { noExternal: true, external: ['react', 'react-dom', 'react/jsx-runtime'] } });
  ({ default: ImportDialog } = await vite.ssrLoadModule('/app/demo/bpmn/modeler/import-dialog.tsx'));
});
after(async () => { await vite?.close(); await window?.happyDOM.abort(); delete globalThis.IS_REACT_ACT_ENVIRONMENT; });
async function mount({ busy = false } = {}) {
  const host = document.createElement('div'), opener = document.createElement('button'); opener.textContent = 'Import XML';
  document.body.append(opener, host); opener.focus();
  const root = createRoot(host); let cancelCount = 0, imports = 0;
  function App() {
    const [open, setOpen] = React.useState(true);
    return open ? React.createElement(ImportDialog, { busy, error: '', confirmation: null, returnFocusTo: opener,
      onImport() { imports++; }, onConfirm() { imports++; }, onCancel() { cancelCount++; setOpen(false); } }) : null;
  }
  await React.act(async () => root.render(React.createElement(App)));
  return { host, opener, get cancelCount() { return cancelCount; }, get imports() { return imports; }, async close() { await React.act(async () => root.unmount()); host.remove(); opener.remove(); } };
}

test('bubbling file-input cancel preserves the open dialog and its loaded XML draft', async () => {
  const h = await mount();
  try {
    const dialog = h.host.querySelector('dialog'), input = h.host.querySelector('input[type="file"]');
    const draft = '<bpmn:definitions id="KeepDraft">Unicode ı 日本語</bpmn:definitions>';
    const transfer = new window.DataTransfer(); transfer.items.add(new window.File([draft], 'draft.bpmn', { type: 'application/xml' })); input.files = transfer.files;
    await React.act(async () => { input.dispatchEvent(new window.Event('change', { bubbles: true })); });
    assert.equal(h.host.querySelector('textarea').value, draft); assert.equal(dialog.open, true);
    // Execute the installed FileChooser implementation against this actual DOM input.
    // Its evaluate callback emits a synthetic bubbling cancel; this is not native Chrome evidence.
    let cancelled; input.addEventListener('cancel', event => { cancelled = event; });
    const picker = new FileChooser({ evaluate: callback => callback(input) }, false);
    await React.act(async () => picker.cancel());
    assert.equal(cancelled.bubbles, true); assert.equal(cancelled.cancelable, false);
    assert.ok(cancelled instanceof window.Event); // Happy DOM does not implement isTrusted; Chrome asserts it separately.
    assert.ok(h.host.querySelector('dialog') === dialog, 'file cancellation must retain the dialog'); assert.equal(dialog.open, true);
    assert.equal(h.host.querySelector('textarea').value, draft); assert.equal(h.cancelCount, 0); assert.equal(h.imports, 0);
    const escape = new window.Event('cancel', { cancelable: true });
    await React.act(async () => dialog.dispatchEvent(escape));
    assert.equal(escape.defaultPrevented, true); assert.equal(h.cancelCount, 1);
    assert.equal(h.host.querySelector('dialog'), null); assert.ok(document.activeElement === h.opener, 'focus returns to opener');
  } finally { await h.close(); }
});

test('a busy import prevents dialog Escape, while ordinary Cancel dismisses without importing', async () => {
  const busy = await mount({ busy: true });
  try {
    const dialog = busy.host.querySelector('dialog'), event = new window.Event('cancel', { cancelable: true });
    await React.act(async () => dialog.dispatchEvent(event));
    assert.equal(event.defaultPrevented, true); assert.equal(dialog.open, true); assert.equal(busy.cancelCount, 0);
    assert.equal(busy.host.querySelector('button[type="button"]').disabled, true); assert.equal(busy.imports, 0);
  } finally { await busy.close(); }
  const ready = await mount();
  try {
    await React.act(async () => ready.host.querySelector('button[type="button"]').click());
    assert.equal(ready.cancelCount, 1); assert.equal(ready.imports, 0);
    assert.equal(ready.host.querySelector('dialog'), null); assert.ok(document.activeElement === ready.opener, 'focus returns to opener');
  } finally { await ready.close(); }
});
