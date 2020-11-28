import React from 'react';

const TextContent: React.FC = ({ children }) => {
	return (
		<div className="px-10 text-2xl text-left font-encode-sans">
			{children}
		</div>
	);
};

export default TextContent;
