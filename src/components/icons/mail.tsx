import * as React from 'react';

function SvgMail(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 33 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M32.87 2v20c0 1.133-.866 2-2 2h-2V5.85l-12 8.617-12-8.618V24h-2c-1.134 0-2-.867-2-2V2c0-.566.217-1.066.576-1.424A1.98 1.98 0 012.87 0h.666l13.334 9.667L30.204 0h.667a1.99 1.99 0 011.425.576c.36.358.575.858.575 1.424z"
        fill="#fff"
      />
    </svg>
  );
}

export default SvgMail;
