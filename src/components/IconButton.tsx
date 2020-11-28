import React from 'react';

interface Props {
	children: React.ReactNode;
}

const IconButton: React.FC<Props> = ({ children }) => {
	return (
		<div className="transition-transform transform hover:scale-110 cursor-pointer">
			{children}
		</div>
	);
};

export default IconButton;
