interface Project {
	title: string;
	text: string;
	images: {
		avif: string;
		png: string;
	};
	sourceUrl: string;
	liveUrl?: string;
}

export default Project;
