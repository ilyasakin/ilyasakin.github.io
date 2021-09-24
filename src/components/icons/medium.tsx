import * as React from 'react';

function SvgMedium(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 44 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M24.707 12c0 6.628-5.336 12-11.918 12C6.207 24 .871 18.628.871 12c0-6.627 5.336-12 11.918-12 6.582 0 11.918 5.373 11.918 12zM37.781 12c0 6.238-2.668 11.297-5.959 11.297-3.291 0-5.959-5.059-5.959-11.297S28.531.703 31.822.703C35.113.703 37.78 5.76 37.78 12M43.13 12c0 5.588-.939 10.12-2.097 10.12-1.157 0-2.095-4.53-2.095-10.12 0-5.589.938-10.12 2.095-10.12 1.158 0 2.096 4.53 2.096 10.12z"
        fill="#fff"
      />
    </svg>
  );
}

export default SvgMedium;
