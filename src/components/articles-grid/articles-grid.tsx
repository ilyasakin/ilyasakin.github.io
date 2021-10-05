import InView from 'react-intersection-observer';

import ArticleCard from '../article-card';
import IArticle from '../../types/IArticle';
import kebabCase from 'kebab-case';

import './articles-grid.scss';
import { usePagination } from '../../context/pagination.context';

interface Props {
  articles: IArticle[];
}

const ArticlesGrid: React.FC<Props> = ({ articles }) => {
  const { setPagination } = usePagination();

  if (articles.length === 0) {
    return <div>No articles found</div>;
  }

  const onInViewChange = (inView: boolean, entry: IntersectionObserverEntry) => {
    if (!inView) return;

    setPagination({ inView: 'articles' });
  };

  return (
    <InView as="div" threshold={0.7} className="articles-grid" onChange={onInViewChange}>
      {articles.map((article: IArticle, index: number) => {
        return (
          <ArticleCard article={article} key={`article-${index}-${kebabCase(article.TITLE)}`} />
        );
      })}
    </InView>
  );
};

export default ArticlesGrid;
