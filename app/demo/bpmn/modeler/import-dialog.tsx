"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../demo.module.css";

export default function ImportDialog({ busy, error, confirmation, returnFocusTo, onImport, onConfirm, onCancel }: {
  busy: boolean;
  error: string;
  confirmation: string | null;
  returnFocusTo: HTMLElement | null;
  onImport: (xml: string, label: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileRequest = useRef(0);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [xml, setXml] = useState("");
  const [filename, setFilename] = useState("");
  const [fileError, setFileError] = useState("");
  const [reading, setReading] = useState(false);
  const blocked = busy || reading;

  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = returnFocusTo;
    const requestToken = fileRequest;
    dialog?.showModal();
    return () => {
      ++requestToken.current;
      dialog?.close();
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [returnFocusTo]);

  useEffect(() => {
    if (confirmation) cancelRef.current?.focus();
  }, [confirmation]);

  async function readFile(file?: File) {
    if (!file) return; // Dismissing the system file picker keeps the draft intact.
    const request = ++fileRequest.current;
    setFileError("");
    if (!/\.(bpmn|xml)$/i.test(file.name)) {
      setFileError("Choose a .bpmn or .xml file.");
      return;
    }
    setReading(true);
    try {
      const text = await file.text();
      if (request !== fileRequest.current) return;
      setXml(text);
      setFilename(file.name);
      if (!text.trim()) setFileError("The file is empty. Choose another file or paste BPMN XML.");
    } catch {
      if (request === fileRequest.current) setFileError("This file could not be read. Choose it again or paste its XML.");
    } finally {
      if (request === fileRequest.current) setReading(false);
    }
  }

  return <dialog ref={dialogRef} className={styles.importDialog} aria-labelledby="import-title"
    aria-describedby="import-description" aria-busy={blocked}
    onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}>
    <form onSubmit={event => { event.preventDefault(); if (!blocked && !fileError) confirmation ? onConfirm() : onImport(xml, filename || "Pasted XML"); }}>
      <h2 id="import-title">{confirmation ? "Replace unsaved changes?" : "Import XML"}</h2>
      <p id="import-description">{confirmation
        ? `Your current diagram has changes. Importing ${confirmation} will replace it and clear its undo history. Cancel to keep editing or export your XML first.`
        : "Paste BPMN XML or choose a local .bpmn or .xml file. Files stay in your browser."}</p>
      {!confirmation && <>
        <label htmlFor="bpmn-import-file">BPMN file</label>
        <input id="bpmn-import-file" type="file" accept=".bpmn,.xml,application/xml,text/xml" disabled={blocked}
          onChange={event => { void readFile(event.target.files?.[0]); event.target.value = ""; }} />
        <label htmlFor="bpmn-import-xml">BPMN XML</label>
        <textarea id="bpmn-import-xml" value={xml} spellCheck={false} disabled={blocked}
          aria-invalid={Boolean(error || fileError)} aria-describedby={error || fileError ? "import-error" : undefined}
          onChange={event => { ++fileRequest.current; setXml(event.target.value); setFilename(""); setFileError(""); }} />
      </>}
      {(error || fileError) && <p id="import-error" className={styles.importError} role="alert">{error || fileError}</p>}
      <div className={styles.importActions}>
        <button ref={cancelRef} type="button" disabled={busy} onClick={onCancel}>Cancel</button>
        <button type="submit" disabled={blocked || Boolean(fileError) || (!confirmation && !xml.trim())}>
          {busy ? "Importing…" : reading ? "Reading file…" : confirmation ? "Replace diagram" : "Import diagram"}
        </button>
      </div>
    </form>
  </dialog>;
}
