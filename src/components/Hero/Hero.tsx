import { Dribbble, Github, LinkedinAlt, Mail, Medium, Resume } from '../icons';
import IconLink from '../IconLink';

import './Hero.scss';

interface Props {
	title: string;
	text: string;
}

const Hero: React.FC<Props> = ({ title, text }) => {
	return (
		<div className="hero">
			<h1 className="hero-title">{title}</h1>
			<div className="hero-text">{text}</div>
			<div className="hero-social">
				<IconLink
					Icon={Github}
					height="24px"
					width="24px"
					href="https://github.com/iakindev"
				/>
				<IconLink
					Icon={Dribbble}
					height="24px"
					width="24px"
					href="https://dribbble.com/ashnwor"
				/>
				<IconLink
					Icon={Mail}
					height="24px"
					width="32px"
					href="mailto:ilyas.akin@yahoo.com"
				/>
				<IconLink
					Icon={Medium}
					height="24px"
					width="42.26px"
					href="https://ilyasakin.medium.com"
				/>
				<IconLink
					Icon={LinkedinAlt}
					height="24px"
					width="24px"
					href="https://www.linkedin.com/in/iakindev"
				/>
				<IconLink
					Icon={Resume}
					height="24px"
					width="24px"
					href="/resume.pdf"
				/>
			</div>
		</div>
	);
};

export default Hero;
