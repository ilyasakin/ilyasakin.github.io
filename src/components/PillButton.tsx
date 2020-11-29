import React from 'react';

interface Props {
	color: string;
	hoverColor: string;
	ringColor: string;
}

const PillButton: React.FC<Props> = ({
	children,
	color,
	hoverColor,
	ringColor,
}) => {
	return (
		<button
			className={`${color} hover:${hoverColor} h-10 rounded-full px-4 font-encode-sans focus:outline-none focus:ring-2 focus:${ringColor} focus:ring-opacity-50`}
		>
			{children}
		</button>
	);
};

export default PillButton;
