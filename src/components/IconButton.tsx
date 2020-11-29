import React from 'react';

interface Props {
	children: React.ReactNode;
	href: string;
	title: string;
}

const IconButton: React.FC<Props> = ({ children, href, title }) => {
	return (
		<a
			href={href}
			className="transition-transform transform hover:scale-110 cursor-pointer"
			target="__blank"
			title={title}
		>
			{children}
		</a>
	);
};

export default IconButton;
