import './icon-link.scss';

interface Props {
  Icon: React.FC<{ width?: string; height?: string }>;
  width?: string;
  height?: string;
  href: string;
  ariaLabel: string;
}

const IconLink: React.FC<Props> = ({ width, height, Icon, href, ariaLabel }) => {
  return (
    <a className="icon-link" href={href} target="__blank" aria-label={ariaLabel} title={ariaLabel}>
      <Icon width={width} height={height} />
    </a>
  );
};

export default IconLink;
