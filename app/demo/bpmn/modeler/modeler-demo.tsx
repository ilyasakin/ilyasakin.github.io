"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../demo.module.css";
// @ts-expect-error — bpmn-xyflow ships untyped JS
import { Modeler } from "bpmn-xyflow";

const SAMPLES = [
  { label: "Empty diagram", path: "empty" },
  { label: "Basic", path: "/bpmn-samples/basic.bpmn" },
  {
    label: "Conditional flows",
    path: "/bpmn-samples/draw/conditional-flow.bpmn",
  },
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
  const modelerRef = useRef<any>(null);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState("");
  const [xmlOut, setXmlOut] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [canExport, setCanExport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportRequestRef = useRef(0);
  const exportBusyRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const modeler = new Modeler({
      container: containerRef.current,
      fitViewOnInit: true,
      minimap: true,
    });
    modelerRef.current = modeler;
    modeler.commandStack.onChange(
      ({ canUndo, canRedo }: { canUndo: boolean; canRedo: boolean }) => {
        setCanUndo(canUndo);
        setCanRedo(canRedo);
      },
    );
    return () => {
      modeler.destroy?.();
      modelerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const modeler = modelerRef.current;
    if (!modeler) return;
    let cancelled = false;
    const controller = new AbortController();
    const sample = SAMPLES[idx];
    ++exportRequestRef.current;
    exportBusyRef.current = false;
    setIsExporting(false);
    setCanExport(false);
    setStatus(`Loading ${sample.label}…`);
    setXmlOut(null);
    (async () => {
      try {
        const xml =
          sample.path === "empty"
            ? EMPTY_BPMN
            : await fetch(sample.path, { signal: controller.signal }).then((r) => {
              if (!r.ok) throw new Error(`HTTP ${r.status}`);
              return r.text();
            });
        if (cancelled) return;
        const result = await modeler.importXML(xml);
        if (cancelled) return;
        setCanExport(true);
        setWarnings(result.warnings.map((warning: { message?: string }) => warning.message || String(warning)));
        setStatus(
          `Loaded ${sample.label} (${result.warnings.length} warnings)`,
        );
      } catch (e) {
        if (!cancelled)
          setStatus("Error: " + (e instanceof Error ? e.message : String(e)));
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [idx]);

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
        <select aria-label="Sample diagram" value={idx} onChange={(e) => { setCanExport(false); setWarnings([]); setIdx(Number(e.target.value)); }}>
          {SAMPLES.map((s, i) => (
            <option key={i} value={i}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          disabled={!canUndo}
          onClick={() => modelerRef.current?.undo()}
          title="Ctrl+Z"
        >
          Undo
        </button>
        <button
          disabled={!canRedo}
          onClick={() => modelerRef.current?.redo()}
          title="Ctrl+Shift+Z"
        >
          Redo
        </button>
        <button
          disabled={!canExport || isExporting}
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
        <span style={{ fontSize: 12, color: "#666" }}>{status}</span>
      </div>
      {warnings.length > 0 && (
        <details className={styles.warnings}>
          <summary>{warnings.length} import warning(s)</summary>
          <ul>{warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>
        </details>
      )}
      <div
        ref={containerRef}
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
