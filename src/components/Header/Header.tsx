import { Logo } from '../icons';
import Pagination from '../Pagination';
import './Header.scss';

const Header: React.FC = () => {
  return (
    <div className="header">
      <Logo width="32px" height="32px" color="#000000" />
      <Pagination />
    </div>
  );
};

export default Header;
