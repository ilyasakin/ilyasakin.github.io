interface Project {
  TITLE: string;
  DESCRIPTION: string;
  IMAGES: {
    AVIF: string;
    PNG: string;
  };
  SOURCE_URL: string;
  LIVE_URL?: string;
}

export default Project;
