import Dot from './pagination-dot';
import './pagination.scss';

const Pagination: React.FC = () => {
  return (
    <div className="pagination">
      <Dot active />
      <Dot />
      <Dot />
    </div>
  );
};

export default Pagination;
