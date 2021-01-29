import './Dot.scss';

interface Props {
	active?: boolean;
}

const Dot: React.FC<Props> = ({ active }) => {
	return (
		<div className="dot-container">
			<div className={`dot ${active && 'dot-active'}`} />
			{active && <div className="text">Landing</div>}
		</div>
	);
};

Dot.defaultProps = {
	active: false,
};

export default Dot;
