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
			className={`flex text-white snap-start
			${equalColumns ? 'flex-col md:flex-row' : ''}
			${className}`}
			style={{ backgroundColor: '#141414' }}
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
