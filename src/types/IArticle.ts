interface IArticle {
  TITLE: string;
  DESCRIPTION?: string;
  IMAGES: {
    AVIF: { 720: string; 1080: string };
    JPG: { 720: string; 1080: string };
  };
}

export default IArticle;
