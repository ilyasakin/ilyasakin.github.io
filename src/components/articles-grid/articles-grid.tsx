import ArticleCard from '../article-card';
import IArticle from '../../types/IArticle';
import kebabCase from 'kebab-case';

import './articles-grid.scss';

interface Props {
  articles: IArticle[];
}

const ArticlesGrid: React.FC<Props> = ({ articles }) => {
  if (articles.length === 0) {
    return <div>No articles found</div>;
  }

  return (
    <div className="articles-grid">
      {articles.map((article: IArticle, index: number) => {
        return (
          <ArticleCard article={article} key={`article-${index}-${kebabCase(article.TITLE)}`} />
        );
      })}
    </div>
  );
};

export default ArticlesGrid;
