import React from 'react';

const CenterTitle: React.FC = ({ children }) => {
	return (
		<div className="text-center text-2xl font-encode-sans my-4 font-bold">
			{children}
		</div>
	);
};

export default CenterTitle;
