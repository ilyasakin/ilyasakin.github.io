import React from 'react';

interface Props {
	children: React.ReactNode;
	className?: string;
	equalColumns?: boolean;
	background?: 'primary' | 'secondary';
}

const Container: React.FC<Props> = ({ children, className, equalColumns }) => {
	return (
		<div
			className={`flex text-white snap-start bg-gray-950 
			${equalColumns ? 'flex-col md:flex-row' : ''}
			${className}`}
		>
			{children}
		</div>
	);
};

Container.defaultProps = {
	className: '',
	background: 'primary',
	equalColumns: false,
};

export default Container;
