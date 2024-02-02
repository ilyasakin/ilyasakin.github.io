import * as React from "react";
import type { SVGProps } from "react";
const SvgMedium = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 40 40"
    {...props}
  >
    <rect
      width={37}
      height={37}
      x={1.5}
      y={1.5}
      stroke="#fff"
      strokeWidth={3}
      rx={18.5}
    />
    <g fill="#fff" clipPath="url(#medium_svg__a)">
      <path d="M21.846 20.182c0 4.519-3.639 8.182-8.126 8.182-4.488 0-8.126-3.663-8.126-8.182S9.232 12 13.72 12s8.126 3.663 8.126 8.182M30.76 20.182c0 4.253-1.819 7.703-4.063 7.703s-4.063-3.45-4.063-7.703 1.819-7.703 4.063-7.703 4.063 3.449 4.063 7.703M34.406 20.182c0 3.81-.64 6.9-1.429 6.9s-1.428-3.09-1.428-6.9.64-6.9 1.428-6.9c.79 0 1.43 3.089 1.43 6.9" />
    </g>
    <defs>
      <clipPath id="medium_svg__a">
        <path fill="#fff" d="M5 12h30v16.364H5z" />
      </clipPath>
    </defs>
  </svg>
);
export default SvgMedium;
