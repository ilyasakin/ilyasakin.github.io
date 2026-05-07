"use client";

import { useEffect, useRef, useState } from "react";
// @ts-expect-error — bpmn-xyflow ships untyped JS
import { BpmnViewer } from "bpmn-xyflow/lib/react";

const SAMPLES = [
  { label: "Basic", path: "/bpmn-samples/basic.bpmn" },
  { label: "Task types", path: "/bpmn-samples/draw/task-types.bpmn" },
  {
    label: "Conditional flows",
    path: "/bpmn-samples/draw/conditional-flow.bpmn",
  },
  { label: "Pools (collaboration)", path: "/bpmn-samples/collaboration.bpmn" },
  { label: "Complex", path: "/bpmn-samples/complex.bpmn" },
];

type SelectionElement = {
  type: string;
  businessObject?: { name?: string };
};

export default function ViewerDemo() {
  const [idx, setIdx] = useState(0);
  const [xml, setXml] = useState("");
  const [status, setStatus] = useState("");
  const [selection, setSelection] = useState<SelectionElement[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus(`Fetching ${SAMPLES[idx].label}…`);
    fetch(SAMPLES[idx].path)
      .then((r) => r.text())
      .then((text) => {
        if (!cancelled) setXml(text);
      })
      .catch((err) => {
        if (!cancelled) setStatus("Fetch error: " + err.message);
      });
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
        <strong style={{ fontSize: 13 }}>bpmn-xyflow viewer</strong>
        <select value={idx} onChange={(e) => setIdx(Number(e.target.value))}>
          {SAMPLES.map((s, i) => (
            <option key={i} value={i}>
              {s.label}
            </option>
          ))}
        </select>
        <button onClick={() => viewerRef.current?.fitView()}>Fit view</button>
        <button
          onClick={() =>
            viewerRef.current?.setViewport({ x: 0, y: 0, zoom: 1 })
          }
        >
          Reset
        </button>
        <a href="/demo/bpmn/modeler" style={{ fontSize: 12 }}>
          → modeler
        </a>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "#666" }}>
          {selection.length
            ? `Selected: ${selection
                .map(
                  (e) =>
                    e.type.replace("bpmn:", "") +
                    (e.businessObject?.name ? ` "${e.businessObject.name}"` : ""),
                )
                .join(", ")}`
            : ""}
        </span>
        <span style={{ fontSize: 12, color: "#666" }}>{status}</span>
      </div>
      <div style={{ flex: 1, background: "#fff", minHeight: 0 }}>
        {xml && (
          <BpmnViewer
            ref={viewerRef}
            xml={xml}
            minimap
            onLoad={(result: { warnings: unknown[] }) =>
              setStatus(`Loaded (${result.warnings.length} warnings)`)
            }
            onError={(err: Error) => setStatus("Error: " + err.message)}
            onSelectionChange={({
              elements,
            }: {
              elements: SelectionElement[];
            }) => setSelection(elements)}
          />
        )}
      </div>
    </div>
  );
}
