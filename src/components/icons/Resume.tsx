import * as React from 'react';

function SvgResume(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 50 50"
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			{...props}
		>
			<g fill="#fff">
				<path d="M49 7H1v36h48V7zm-2 34H3V9h44v32z" />
				<path d="M23 27c0-2.449-1.773-4.483-4.101-4.909C19.577 21.237 20 20.172 20 19c0-2.757-2.243-5-5-5s-5 2.243-5 5c0 1.172.422 2.237 1.101 3.091C8.773 22.517 7 24.551 7 27v7h16v-7zm-8-11c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3zm6 16H9v-5c0-1.654 1.346-3 3-3h6c1.654 0 3 1.346 3 3v5zM26 17h7v2h-7zM36 17h7v2h-7zM26 22h3v2h-3zM32 22h11v2H32zM26 27h8v2h-8zM39 27h4v2h-4zM26 32h2v2h-2zM30 32h2v2h-2zM34 32h2v2h-2zM41 32h2v2h-2z" />
			</g>
		</svg>
	);
}

export default SvgResume;
