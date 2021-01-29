import { Logo } from '../icons';
import './Header.scss';

const Header: React.FC = () => {
	return (
		<div className="header">
			<Logo width="22px" height="22px" />
		</div>
	);
};

export default Header;
