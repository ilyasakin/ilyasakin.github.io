import React from 'react';

interface Props {
	children: React.ReactNode;
	background?: 'primary' | 'secondary';
}

const Container: React.FC<Props> = ({ children }) => {
	return (
		<div
			className="flex h-screen text-white"
			style={{ backgroundColor: '#141414' }}
		>
			{children}
		</div>
	);
};

Container.defaultProps = {
	background: 'primary',
};

export default Container;
