import './dot.scss';

interface Props {
  active?: boolean;
  pageName: string;
  onClick: () => void;
}

const Dot: React.FC<Props> = ({ active, pageName, onClick }) => {
  return (
    <div className="dot-container">
      <button onClick={onClick} className={`dot ${active && 'dot-active'}`} />
      {active && <div className="text">{pageName}</div>}
    </div>
  );
};

Dot.defaultProps = {
  active: false,
};

export default Dot;
