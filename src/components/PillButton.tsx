import React from 'react';

interface Props {
	color: string;
	hoverColor: string;
	ringColor: string;
	href: string;
}

const PillButton: React.FC<Props> = ({
	children,
	color,
	hoverColor,
	ringColor,
	href,
}) => {
	return (
		<a
			href={href}
			target="__blank"
			className={`${color} hover:${hoverColor} block rounded-full px-4 py-2 font-encode-sans focus:outline-none focus:ring-2 focus:${ringColor} focus:ring-opacity-50`}
		>
			{children}
		</a>
	);
};

export default PillButton;
