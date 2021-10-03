import './article-card.scss';
import IArticle from '../../types/IArticle';
import IconLink from '../icon-link';
import { Medium } from '../icons';

interface Props {
  article: IArticle;
}

const ArticleCard: React.FC<Props> = ({ article }) => {
  return (
    <div className="article-card">
      <picture className="article-card-image">
        <source
          srcSet={`${article.IMAGES.AVIF[720]}`}
          media="(min-width: 1024px)"
          type="image/avif"
        />

        <source
          srcSet={`${article.IMAGES.AVIF[1080]}`}
          media="(max-width: 1024px)"
          type="image/avif"
        />

        <source
          srcSet={`${article.IMAGES.JPG[720]}`}
          media="(min-width: 1024px)"
          type="image/jpg"
        />

        <source
          srcSet={`${article.IMAGES.JPG[1080]}`}
          media="(max-width: 1024px)"
          type="image/jpg"
        />

        <img
          className="article-card-image"
          src={article.IMAGES.JPG[720]}
          loading="lazy"
          decoding="async"
          style={{ aspectRatio: '1920 / 1080' }}
          alt={article.TITLE}
        />
      </picture>
      <div className="article-card-content">
        <div className="article-card-content-title">{article.TITLE}</div>
        {article.DESCRIPTION && (
          <div className="article-card-content-text">
            {article.DESCRIPTION.split('\n').map((line: string, index: number) => {
              return <div key={`${article.TITLE}_${index}`}>{`${line}`}</div>;
            })}
          </div>
        )}
      </div>
      <div className="article-card-links">
        <IconLink
          Icon={Medium}
          height="1.5rem"
          width="1.5rem"
          ariaLabel="Read article"
          href={article.URL}
        />
      </div>
    </div>
  );
};

export default ArticleCard;
