# My Personal Site

[Visit the site](https://ilyasakin.dev)

## Development

Use Node.js 24 LTS and Bun 1.4.2 (the package manager for `bun.lock`).
Clone with `git clone --recurse-submodules`, or run
`git submodule update --init --recursive` after cloning: the BPMN demos depend
on the pinned source in `vendor/bpmn-xyflow`.

- `bun install --frozen-lockfile --ignore-scripts` installs the locked dependencies
- `bun run dev` starts the development server
- `bun run lint` runs ESLint directly (Next.js 16 removed `next lint`)
- `bun run typecheck` generates route types and checks with native TypeScript 7
- `bun run build` creates the production build
- `bun run check` runs lint, type checking, and production build in order

The lint setup uses ESLint 9 because the React plugin and Next's bundled Babel
parser are not compatible with ESLint 10. TypeScript is installed side-by-side
using Microsoft's [official compatibility pattern](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/):
`@typescript/native` provides the TypeScript 7 `tsc` executable, while `typescript`
provides the TypeScript 6 API required by ESLint. Next 16.3's built-in type check
uses that API because its CLI path assumes `typescript/bin/tsc`; the separate
`typecheck` step still validates the project with TypeScript 7.

The build fetches the Google font and Medium feed, so CI needs outbound access
to those services. Vendored BPMN source is excluded from this site's lint scope.

## BPMN modeler import and export

The modeler toolbar includes **Import XML**. Paste BPMN XML or choose a local
`.bpmn` or `.xml` file, then choose **Import diagram**. Files are read in the
browser. The current diagram is replaced only after explicit submission; parse
errors appear in the dialog and leave its XML, selection, viewport and history
intact. Cancel or Escape dismisses the dialog without importing.

Replacing a changed diagram, including changes made inside a subprocess, asks
for confirmation first. The sample selector uses the same protection. Export
your XML before confirming if you want to keep those changes. A successful
import resets the old selection and undo/redo history, and any import warnings
are listed above the canvas. **Export XML** displays text for copying; viewing
that text does not mark an edited diagram as saved.

`bun run test:bpmn:import` checks the site's import coordinator against the real
Modeler and all three business samples, including failed/cancelled imports,
whole-document change detection and inert XML content. The production browser
suite also exercises paste and file import through the actual toolbar/dialog,
export-to-import round trips, unsaved warnings, error recovery and phone layout.
It requires sandbox-capable Chrome via `PUPPETEER_EXECUTABLE_PATH`; structural
checks alone do not certify native browser interaction.

## LICENSE

MIT License

Copyright (c) 2021 ilyas akın

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
