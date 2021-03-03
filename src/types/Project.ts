interface Project {
  TITLE: string;
  DESCRIPTION: string;
  IMAGES: {
    AVIF: { 720: string; 1080: string };
    JPG: { 720: string; 1080: string };
  };
  SOURCE_URL: string;
  LIVE_URL?: string;
}

export default Project;
