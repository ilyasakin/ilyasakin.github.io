import { Dribbble, Github, LinkedinAlt, Mail, Medium, Resume } from '../icons';
import IconLink from '../IconLink';
import Links from '../../types/Links';

import './Hero.scss';

interface Props {
  title: string;
  text: string;
  links: Links;
}

const Hero: React.FC<Props> = ({ title, text, links }) => {
  return (
    <div className="hero">
      <h1 className="hero-title">{title}</h1>
      <div className="hero-text">{text}</div>
      <div className="hero-social">
        <IconLink Icon={Github} height="24px" width="24px" href={links.GITHUB} ariaLabel="GitHub" />
        <IconLink
          Icon={Dribbble}
          height="24px"
          width="24px"
          href={links.DRIBBBLE}
          ariaLabel="Dribbble"
        />
        <IconLink Icon={Mail} height="24px" width="32px" href={links.MAIL} ariaLabel="Mail" />
        <IconLink
          Icon={Medium}
          height="24px"
          width="42.26px"
          href={links.MEDIUM}
          ariaLabel="Medium"
        />
        <IconLink
          Icon={LinkedinAlt}
          height="24px"
          width="24px"
          href={links.MEDIUM}
          ariaLabel="LinkedIn"
        />
        <IconLink Icon={Resume} height="24px" width="24px" href={links.RESUME} ariaLabel="Resume" />
      </div>
    </div>
  );
};

export default Hero;
