import * as React from "react";
import type { SVGProps } from "react";
const SvgGlobe = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 20"
    {...props}
  >
    <path
      fill="currentColor"
      d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0M9 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L7 13v1c0 1.1.9 2 2 2zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H6V8h2c.55 0 1-.45 1-1V5h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39"
    />
  </svg>
);
export default SvgGlobe;
