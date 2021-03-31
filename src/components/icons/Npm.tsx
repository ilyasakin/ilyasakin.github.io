import * as React from 'react';

function SvgNpm(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 93 37"
      fill="#fff"
      fillRule="evenodd"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
      {...props}
    >
      <use xlinkHref="#npm_svg__a" x={0.5} y={0.5} />
      <symbol id="npm_svg__a" overflow="visible">
        <g stroke="none" fillRule="nonzero">
          <path d="M0 0v30.602h25.472v5.13h20.342v-5.13h45.814V0z" fill="#cb3837" />
          <path d="M15.212 5.13H5.129v20.342h10.083V10.26h5.13v15.213h5.13V5.13zm15.4 0v25.472h10.26v-5.13h10.072V5.13zm15.202 15.212h-4.953V10.26h4.953zM66.156 5.13H56.074v20.342h10.083V10.26h5.13v15.213h5.13V10.26h5.13v15.213h5.13V5.13z" />
        </g>
      </symbol>
    </svg>
  );
}

export default SvgNpm;
