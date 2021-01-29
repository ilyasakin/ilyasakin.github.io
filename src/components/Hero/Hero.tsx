import { Dribbble, Github, LinkedinAlt, Mail, Medium, Resume } from '../icons';
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
				<Github height="24px" width="24px" />
				<Dribbble height="24px" width="24px" />
				<Mail height="24px" width="32px" />
				<Medium height="24px" width="42.26px" />
				<LinkedinAlt height="24px" width="24px" />
				<Resume height="24px" width="32px" />
			</div>
		</div>
	);
};

export default Hero;
