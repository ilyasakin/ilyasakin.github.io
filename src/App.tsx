import Header from './components/Header';
import Hero from './components/Hero';
import './styles/App.scss';

const App = () => {
	// const GITHUB_URL = 'https://www.github.com/iakindev';
	// const LINKEDIN_URL = 'https://www.linkedin.com/in/iakindev';
	// const MAIL_URL = 'mailto:ilyas.akin@yahoo.com';
	// const MEDIUM_URL = 'https://ilyasakin.medium.com/';
	// const RESUME_URL = 'https://ilyasakin.codes/resume.pdf';

	return (
		<div className="main">
			<Header />
			<div className="content">
				<Hero
					title="Hi, I’m İlyas Akın, a software developer."
					text="Currently I’m working at DOGO as Front-end Developer"
				/>
			</div>
		</div>
	);
};

export default App;
