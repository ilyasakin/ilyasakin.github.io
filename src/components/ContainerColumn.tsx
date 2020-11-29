import React from 'react';

const ContainerColumn: React.FC = ({ children }) => {
	return (
		<div className="h-screen flex-grow transition duration-300 hover:bg-gray-1000 md:flex-basis-0">
			{children}
		</div>
	);
};

export default ContainerColumn;
