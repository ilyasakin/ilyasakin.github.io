import * as React from 'react';

function SvgMedium(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 448 448"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			{...props}
		>
			<path
				d="M0 0v448h448V0H0zm372.2 106.1l-24 23c-2.1 1.6-3.1 4.2-2.7 6.7v169.3c-.4 2.6.6 5.2 2.7 6.7l23.5 23v5.1h-118V335l24.3-23.6c2.4-2.4 2.4-3.1 2.4-6.7V167.8l-67.6 171.6h-9.1L125 167.8v115c-.7 4.8 1 9.7 4.4 13.2l31.6 38.3v5.1H71.2v-5.1l31.6-38.3c3.4-3.5 4.9-8.4 4.1-13.2v-133c.4-3.7-1-7.3-3.8-9.8L75 106.1V101h87.3l67.4 148L289 101.1h83.2v5z"
				fill="#fff"
			/>
		</svg>
	);
}

export default SvgMedium;
