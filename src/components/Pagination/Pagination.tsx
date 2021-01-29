import Dot from '../Dot';
import './Pagination.scss';

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
