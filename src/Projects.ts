import Project from './types/Project';
import SpotifyAVIF from './assets/images/spotify-clone.avif';
import SpotifyPNG from './assets/images/spotify-clone.png';

const Projects: Project[] = [
  {
    TITLE: 'Deliquus',
    DESCRIPTION: `
    A cli coverage tool but checks if they exists and returns clean exit or error.
    
    Written in TypeScript in NodeJS.
    
    User can match multiple sources with multiple targets.
    For example, you have a components directory as a source.
    You can make it check if tests and stories exist for components.`,
    IMAGES: {
      AVIF: SpotifyAVIF,
      PNG: SpotifyPNG,
    },
    SOURCE_URL: 'https://github.com/iakindev/deliquus',
    LIVE_URL: 'https://www.npmjs.com/package/deliquus',
  },
  {
    TITLE: 'Spotify Clone',
    DESCRIPTION: `A shallow Spotify Clone with front-end and back-end.
    
    Front-end built with React, React Router, TypeScript and SCSS.
    Back-end built with Express and Mongoose.
    
    Learned how to not to structure components, how to not write maintainable css etc. Made a lot of mistakes and learned a lot.`,
    IMAGES: {
      AVIF: SpotifyAVIF,
      PNG: SpotifyPNG,
    },
    SOURCE_URL: 'https://github.com/iakindev/spotify-clone',
    LIVE_URL: 'https://ilyasakin.codes/spotify-clone',
  },
  {
    TITLE: 'Hello',
    DESCRIPTION: 'Hello',
    IMAGES: {
      AVIF: SpotifyAVIF,
      PNG: SpotifyPNG,
    },
    SOURCE_URL: '#',
    LIVE_URL: '#',
  },
];

export default Projects;
