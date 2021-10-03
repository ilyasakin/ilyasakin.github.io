import IArticle from '../types/IArticle';

import NodeRedAVIF_720 from '../assets/images/node-red_720.avif';
import NodeRedAVIF_1080 from '../assets/images/node-red_1080.avif';

import NodeRedPNG_720 from '../assets/images/node-red_720.png';
import NodeRedPNG_1080 from '../assets/images/node-red_1080.png';

import UIUXArticleAVIF_720 from '../assets/images/ui-ux_article_720.avif';
import UIUXArticleAVIF_1080 from '../assets/images/ui-ux_article_1080.avif';

import UIUXArticleJPEG_720 from '../assets/images/ui-ux_article_720.jpeg';
import UIUXArticleJPEG_1080 from '../assets/images/ui-ux_article_1080.jpeg';

import AvoidTailwindAVIF_720 from '../assets/images/avoid-tailwind_720.avif';
import AvoidTailwindAVIF_1080 from '../assets/images/avoid-tailwind_1080.avif';

import AvoidTailwindJPEG_720 from '../assets/images/avoid-tailwind_720.png';
import AvoidTailwindJPEG_1080 from '../assets/images/avoid-tailwind_1080.png';

const articles: IArticle[] = [
  {
    TITLE: 'Node-RED is bad for your enterprise-grade services',
    IMAGES: {
      AVIF: { 720: NodeRedAVIF_720, 1080: NodeRedAVIF_1080 },
      JPG: { 720: NodeRedPNG_720, 1080: NodeRedPNG_1080 },
    },
    URL: 'https://ilyasakin.medium.com/node-red-is-bad-for-your-enterprise-grade-services-68d7215355f9',
  },
  {
    TITLE: 'You should learn UI/UX as a front-end developer',
    IMAGES: {
      AVIF: { 720: UIUXArticleAVIF_720, 1080: UIUXArticleAVIF_1080 },
      JPG: { 720: UIUXArticleJPEG_720, 1080: UIUXArticleJPEG_1080 },
    },
    URL: 'https://ilyasakin.medium.com/you-should-learn-ui-ux-as-a-front-end-developer-58f8b434690f',
  },
  {
    TITLE: 'You should avoid Tailwind',
    IMAGES: {
      AVIF: { 720: AvoidTailwindAVIF_720, 1080: AvoidTailwindAVIF_1080 },
      JPG: { 720: AvoidTailwindJPEG_720, 1080: AvoidTailwindJPEG_1080 },
    },
    URL: 'https://ilyasakin.medium.com/you-should-avoid-tailwind-3e6fd32a1ded',
  },
];

export default articles;
