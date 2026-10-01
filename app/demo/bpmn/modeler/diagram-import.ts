import type { Modeler, ImportResult } from "bpmn-xyflow";

export type DiagramInput = { xml: string; label: string; sample: number | null };
export type ImportOutcome =
  | { kind: "confirmation"; input: DiagramInput }
  | { kind: "loaded"; input: DiagramInput; result: ImportResult }
  | { kind: "cancelled" };

/** One replacement at a time; compare the complete document, including drilled views. */
export class DiagramImportSession {
  private baseline: string | null = null;
  private pending: DiagramInput | null = null;
  private generation = 0;
  private busy = false;

  private readonly modeler: Pick<Modeler, "getXML" | "importXML">;

  constructor(modeler: Pick<Modeler, "getXML" | "importXML">) {
    this.modeler = modeler;
  }

  cancel() {
    this.pending = null;
    this.generation++;
  }

  async request(input: DiagramInput): Promise<ImportOutcome> {
    if (!input.xml.trim()) throw new Error("Paste BPMN XML or choose a .bpmn or .xml file.");
    if (this.busy) throw new Error("A diagram is already loading.");
    this.busy = true;
    const generation = ++this.generation;
    this.pending = null;
    try {
      if (this.baseline !== null) {
        const current = await this.modeler.getXML();
        if (generation !== this.generation) return { kind: "cancelled" };
        if (current !== this.baseline) {
          this.pending = input;
          return { kind: "confirmation", input };
        }
      }
      return await this.load(input);
    } finally {
      this.busy = false;
    }
  }

  async confirm(): Promise<ImportOutcome> {
    if (this.busy) throw new Error("A diagram is already loading.");
    const input = this.pending;
    if (!input) return { kind: "cancelled" };
    this.pending = null;
    this.busy = true;
    try {
      return await this.load(input);
    } finally {
      this.busy = false;
    }
  }

  private async load(input: DiagramInput): Promise<ImportOutcome> {
    // The modeler's validated import keeps the current diagram/history on parse failure
    // and resets selection, navigation and history only after a successful import.
    const result = await this.modeler.importXML(input.xml);
    this.baseline = await this.modeler.getXML();
    return { kind: "loaded", input, result };
  }
}
