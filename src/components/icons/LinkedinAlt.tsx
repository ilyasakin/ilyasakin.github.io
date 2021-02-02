import * as React from 'react';

function SvgLinkedinAlt(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#linkedin-alt_svg__clip0)">
        <path
          d="M20.576 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.48V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.466 7.433a2.062 2.062 0 01-1.714-3.212 2.064 2.064 0 111.714 3.212zm1.782 13.019H3.684V9h3.564v11.452zM22.354 0H1.9C.921 0 .13.774.13 1.729v20.542C.13 23.227.92 24 1.9 24h20.451c.978 0 1.778-.773 1.778-1.729V1.729C24.13.774 23.33 0 22.351 0h.003z"
          fill="#fff"
        />
      </g>
      <defs>
        <clipPath id="linkedin-alt_svg__clip0">
          <path fill="#fff" transform="translate(.13)" d="M0 0h24v24H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default SvgLinkedinAlt;
