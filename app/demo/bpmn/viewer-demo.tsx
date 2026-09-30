"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./demo.module.css";
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
  const [warnings, setWarnings] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(`Fetching ${SAMPLES[0].label}…`);
  const [selection, setSelection] = useState<SelectionElement[]>([]);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    fetch(SAMPLES[idx].path, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        if (!cancelled) setXml(text);
      })
      .catch((err) => {
        if (!cancelled) setStatus("Fetch error: " + err.message);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [idx]);

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
        <strong style={{ fontSize: 13 }}>bpmn-xyflow viewer</strong>
        <select
          aria-label="Sample diagram"
          value={idx}
          onChange={(e) => {
            const nextIdx = Number(e.target.value);
            setStatus(`Fetching ${SAMPLES[nextIdx].label}…`);
            setWarnings([]);
            setSelection([]);
            setIdx(nextIdx);
          }}
        >
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
        <form className={styles.search} onSubmit={(event) => {
          event.preventDefault();
          const viewer = viewerRef.current?.getViewer();
          const matches = viewer?.findElements(query) || [];
          if (matches[0]) viewer.focusElement(matches[0].id);
          setStatus(matches.length ? `${matches.length} matching element(s)` : "No matching elements");
        }}>
          <input aria-label="Find by name or ID" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or ID" />
          <button type="submit">Find</button>
        </form>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "#666" }}>
          {selection.length
            ? `Selected: ${selection
                .map(
                  (e) =>
                    e.type.replace("bpmn:", "") +
                    (e.businessObject?.name
                      ? ` "${e.businessObject.name}"`
                      : ""),
                )
                .join(", ")}`
            : ""}
        </span>
        <span style={{ fontSize: 12, color: "#666" }}>{status}</span>
      </div>
      {warnings.length > 0 && (
        <details className={styles.warnings}>
          <summary>{warnings.length} import warning(s)</summary>
          <ul>{warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>
        </details>
      )}
      <div style={{ flex: 1, background: "#fff", minHeight: 0 }}>
        {xml && (
          <BpmnViewer
            ref={viewerRef}
            xml={xml}
            minimap
            onLoad={(result: { warnings: { message?: string }[] }) => {
              setWarnings(result.warnings.map((warning) => warning.message || String(warning)));
              setStatus(`Loaded (${result.warnings.length} warnings)`);
            }}
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
