import Dot from './pagination-dot';
import { usePagination } from '../../context/pagination.context';
import './pagination.scss';

const Pagination: React.FC = () => {
  const { pagination, setPagination } = usePagination();

  return (
    <div className="pagination">
      <Dot
        pageName="Landing"
        active={pagination.inView === 'landing'}
        onClick={() => setPagination({ inView: 'landing' })}
      />
      <Dot
        pageName="Projects"
        active={pagination.inView === 'projects'}
        onClick={() => setPagination({ inView: 'projects' })}
      />
      <Dot
        pageName="Articles"
        active={pagination.inView === 'articles'}
        onClick={() => setPagination({ inView: 'articles' })}
      />
    </div>
  );
};

export default Pagination;
