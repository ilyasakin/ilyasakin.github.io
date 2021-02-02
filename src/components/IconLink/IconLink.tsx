import './IconLink.scss';

interface Props {
  Icon: React.FC<{ width: string; height: string }>;
  width: string;
  height: string;
  href: string;
}
const IconLink: React.FC<Props> = ({ width, height, Icon, href }) => {
  return (
    <a className="icon-link" href={href} target="__blank">
      <Icon width={width} height={height} />
    </a>
  );
};

export default IconLink;
