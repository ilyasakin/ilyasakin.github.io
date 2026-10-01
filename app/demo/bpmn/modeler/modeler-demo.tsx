"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../demo.module.css";
import { Modeler } from "bpmn-xyflow";
import ImportDialog from "./import-dialog";
import { DiagramImportSession, type DiagramInput, type ImportOutcome } from "./diagram-import";

const SAMPLES = [
  { label: "Empty diagram", path: "empty" },
  { label: "Basic", path: "/bpmn-samples/basic.bpmn" },
  {
    label: "Conditional flows",
    path: "/bpmn-samples/draw/conditional-flow.bpmn",
  },
  { label: "Order, payment and delivery", path: "/bpmn-samples/scenarios/order-payment-delivery.bpmn" },
  { label: "Approval, rejection and rework", path: "/bpmn-samples/scenarios/approval-rejection-rework.bpmn" },
  { label: "Booking, timeout and compensation", path: "/bpmn-samples/scenarios/booking-timeout-compensation.bpmn" },
  { label: "HR recruitment (retained example)", path: "/bpmn-samples/complex.bpmn" },
];

const EMPTY_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="102" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

export default function ModelerDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modelerRef = useRef<Modeler | null>(null);
  const [idx, setIdx] = useState<number | null>(0);
  const [status, setStatus] = useState("");
  const [xmlOut, setXmlOut] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [canExport, setCanExport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [importError, setImportError] = useState("");
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const importSessionRef = useRef<DiagramImportSession | null>(null);
  const importReturnFocusRef = useRef<HTMLElement | null>(null);
  const loadBusyRef = useRef(false);
  const sampleRequestRef = useRef(0);
  const exportRequestRef = useRef(0);
  const exportBusyRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const sampleRequest = sampleRequestRef;
    const modeler = new Modeler({
      container: containerRef.current,
      fitViewOnInit: true,
      minimap: true,
    });
    modelerRef.current = modeler;
    const session = new DiagramImportSession(modeler);
    importSessionRef.current = session;
    modeler.commandStack.onChange(
      ({ canUndo, canRedo }: { canUndo: boolean; canRedo: boolean }) => {
        setCanUndo(canUndo);
        setCanRedo(canRedo);
      },
    );
    void session.request({ xml: EMPTY_BPMN, label: "Empty diagram", sample: 0 }).then(outcome => {
      if (modelerRef.current === modeler) finishImport(outcome);
    }).catch(error => {
      if (modelerRef.current === modeler) setStatus("Error: " + errorMessage(error));
    }).finally(() => {
      if (modelerRef.current === modeler) setIsLoading(false);
    });
    return () => {
      ++sampleRequest.current;
      session.cancel();
      importSessionRef.current = null;
      modeler.destroy?.();
      modelerRef.current = null;
    };
  }, []);

  function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }

  function finishImport(outcome: ImportOutcome) {
    if (outcome.kind === "confirmation") {
      setConfirmation(outcome.input.label);
      setImportOpen(true);
    } else if (outcome.kind === "loaded") {
      ++exportRequestRef.current;
      exportBusyRef.current = false;
      setIsExporting(false);
      setXmlOut(null);
      setCanExport(true);
      setIdx(outcome.input.sample);
      setWarnings(outcome.result.warnings.map(warning => warning.message || String(warning)));
      setStatus(`Loaded ${outcome.input.label} (${outcome.result.warnings.length} warnings)`);
      setImportOpen(false);
      setConfirmation(null);
      setImportError("");
    }
  }

  async function replaceDiagram(input?: DiagramInput) {
    const session = importSessionRef.current;
    if (!session || loadBusyRef.current) return;
    loadBusyRef.current = true;
    setIsLoading(true);
    setImportError("");
    try {
      const outcome = input ? await session.request(input) : await session.confirm();
      if (importSessionRef.current === session) finishImport(outcome);
    } catch (error) {
      if (importSessionRef.current === session) {
        setImportError(errorMessage(error));
        setConfirmation(null);
        setImportOpen(true);
      }
    } finally {
      if (importSessionRef.current === session) {
        loadBusyRef.current = false;
        setIsLoading(false);
      }
    }
  }

  async function chooseSample(index: number) {
    if (loadBusyRef.current || isLoading) return;
    const sample = SAMPLES[index], request = ++sampleRequestRef.current;
    loadBusyRef.current = true;
    setIsLoading(true);
    try {
      const xml = sample.path === "empty" ? EMPTY_BPMN : await fetch(sample.path).then(response => {
        if (!response.ok) throw new Error(`Could not load ${sample.label} (HTTP ${response.status}).`);
        return response.text();
      });
      if (request !== sampleRequestRef.current) return;
      loadBusyRef.current = false;
      await replaceDiagram({ xml, label: sample.label, sample: index });
    } catch (error) {
      if (request === sampleRequestRef.current) setStatus("Error: " + errorMessage(error));
    } finally {
      if (request === sampleRequestRef.current) {
        loadBusyRef.current = false;
        setIsLoading(false);
      }
    }
  }

  function cancelImport() {
    importSessionRef.current?.cancel();
    setImportOpen(false);
    setConfirmation(null);
    setImportError("");
  }

  async function exportXML() {
    const modeler = modelerRef.current;
    if (!modeler || !canExport || exportBusyRef.current) return;
    const request = ++exportRequestRef.current;
    exportBusyRef.current = true;
    setIsExporting(true);
    try {
      const xml = await modeler.getXML();
      if (request !== exportRequestRef.current || modelerRef.current !== modeler) return;
      setXmlOut(xml);
    } catch (error) {
      if (request === exportRequestRef.current && modelerRef.current === modeler) {
        setStatus("Export error: " + (error instanceof Error ? error.message : String(error)));
      }
    } finally {
      if (request === exportRequestRef.current && modelerRef.current === modeler) {
        exportBusyRef.current = false;
        setIsExporting(false);
      }
    }
  }

  return (
    <div
      className={styles.demo}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#fafafa",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid #e6e6e6",
          background: "#fff",
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <strong style={{ fontSize: 13 }}>bpmn-xyflow modeler</strong>
        <select aria-label="Sample diagram" value={idx ?? "imported"} disabled={isLoading || importOpen} onChange={event => { importReturnFocusRef.current = event.currentTarget; void chooseSample(Number(event.target.value)); }}>
          {idx === null && <option value="imported" disabled>Imported diagram</option>}
          {SAMPLES.map((s, i) => (
            <option key={i} value={i}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          disabled={!canUndo || isLoading || importOpen}
          onClick={() => modelerRef.current?.undo()}
          title="Ctrl+Z"
        >
          Undo
        </button>
        <button
          disabled={!canRedo || isLoading || importOpen}
          onClick={() => modelerRef.current?.redo()}
          title="Ctrl+Shift+Z"
        >
          Redo
        </button>
        <button disabled={isLoading || importOpen} onClick={event => { importReturnFocusRef.current = event.currentTarget; setImportError(""); setConfirmation(null); setImportOpen(true); }}>
          Import XML
        </button>
        <button
          disabled={!canExport || isExporting || isLoading || importOpen}
          aria-busy={isExporting}
          onClick={exportXML}
        >
          {isExporting ? "Exporting…" : "Export XML"}
        </button>
        <a href="/demo/bpmn" style={{ fontSize: 12 }}>
          → viewer
        </a>
        <span style={{ fontSize: 11, color: "#888" }}>
          tip: drag • shift+drag to connect • dbl-click to rename • Del to
          delete
        </span>
        <span style={{ flex: 1 }} />
        <span role="status" style={{ fontSize: 12, color: "#666" }}>{isLoading ? "Loading diagram…" : status}</span>
      </div>
      {importOpen && <ImportDialog busy={isLoading} error={importError} confirmation={confirmation} returnFocusTo={importReturnFocusRef.current}
        onImport={(xml, label) => { void replaceDiagram({ xml, label, sample: null }); }}
        onConfirm={() => { void replaceDiagram(); }} onCancel={cancelImport} />}
      {warnings.length > 0 && (
        <details className={styles.warnings}>
          <summary>{warnings.length} import warning(s)</summary>
          <ul>{warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>
        </details>
      )}
      <div
        ref={containerRef}
        inert={isLoading || importOpen}
        style={{
          flex: 1,
          background: "#fff",
          cursor: "grab",
          minHeight: 0,
        }}
      />
      {xmlOut !== null && (
        <>
        <div className={styles.xmlHeader}>
          <span>Exported BPMN XML</span>
          <button onClick={() => setXmlOut(null)} aria-label="Close XML export">Close</button>
        </div>
        <pre
          style={{
            maxHeight: 240,
            overflow: "auto",
            padding: "8px 14px",
            background: "#f3f3f3",
            borderTop: "1px solid #e6e6e6",
            fontFamily: "monospace",
            fontSize: 11,
            whiteSpace: "pre",
            margin: 0,
          }}
        >
          {xmlOut}
        </pre>
        </>
      )}
    </div>
  );
}
