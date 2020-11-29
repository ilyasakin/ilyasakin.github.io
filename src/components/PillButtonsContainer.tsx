import React from 'react';

const PillButtonsContainer: React.FC = ({ children }) => {
	return (
		<div className="flex items-center justify-center space-x-2 mt-3">
			{children}
		</div>
	);
};

export default PillButtonsContainer;
