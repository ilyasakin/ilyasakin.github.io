import React from 'react';

const ContainerColumn: React.FC = ({ children }) => {
	return (
		<div className="h-screen flex-grow" style={{ flexBasis: 0 }}>
			{children}
		</div>
	);
};

export default ContainerColumn;
