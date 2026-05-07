"use client";

import { useEffect, useRef, useState } from "react";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelerRef = useRef<any>(null);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState("");
  const [xmlOut, setXmlOut] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

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
    const sample = SAMPLES[idx];
    setStatus(`Loading ${sample.label}…`);
    setXmlOut(null);
    (async () => {
      try {
        const xml =
          sample.path === "empty"
            ? EMPTY_BPMN
            : await fetch(sample.path).then((r) => r.text());
        if (cancelled) return;
        const result = await modeler.importXML(xml);
        if (cancelled) return;
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
    };
  }, [idx]);

  return (
    <div
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
        <select value={idx} onChange={(e) => setIdx(Number(e.target.value))}>
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
          onClick={async () => {
            const xml = await modelerRef.current?.getXML();
            setXmlOut(xml ?? null);
          }}
        >
          Export XML
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
      )}
    </div>
  );
}
