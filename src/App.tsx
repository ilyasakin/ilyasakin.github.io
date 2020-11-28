import React from 'react';
import Container from './components/Container';
import IconButton from './components/IconButton';
import ReactTypingEffect from 'react-typing-effect';
import ContainerColumn from './components/ContainerColumn';
import CenterTitle from './components/CenterTitle';
import TextContent from './components/TextContent';
import Bold from './components/Bold';
import {
	Github,
	Linkedin,
	Mail,
	Medium,
	Resume,
	Graphql,
} from './components/icons';
import './App.css';
import CarCalendarImg from './assets/images/callendar-app.png';
import SpotifyCloneImg from './assets/images/spotify-clone.png';
import AirtableCMSImg from './assets/images/airtable-pss.png';
import '@fortawesome/fontawesome-free/css/all.css';

function App() {
	return (
		<div className="App">
			<Container className="h-screen">
				<div className="flex items-center justify-center w-full h-full">
					<div>
						<div className="text-3xl font-encode-sans font-bold">
							ilyas akın
						</div>
						<ReactTypingEffect
							className="font-encode-sans tracking-wider"
							text={['software developer', 'quick learner']}
							speed={100}
							eraseSpeed={100}
							eraseDelay={1000}
						/>
						<hr />
						<div className="flex flex-row justify-between mt-1 space-x-16">
							<IconButton>
								<Github className="w-8 h-8" />
							</IconButton>
							<IconButton>
								<Linkedin className="w-8 h-8" />
							</IconButton>
							<IconButton>
								<Mail className="w-8 h-8" />
							</IconButton>
							<IconButton>
								<Medium className="w-8 h-8" />
							</IconButton>
							<IconButton>
								<Resume className="w-8 h-8" />
							</IconButton>
						</div>
					</div>
				</div>
			</Container>
			<Container equalColumns className="h-auto">
				<ContainerColumn>
					<img src={CarCalendarImg} alt="Project 1" />
					<CenterTitle>Car Calendar</CenterTitle>
					<TextContent>
						This is an app that made for a Rent a Car business. Made
						with <i className="fab fa-react"></i>{' '}
						<Bold>React Native</Bold> using <Bold>Expo</Bold>. Used
						<Bold>Prettier</Bold> for formatting and used{' '}
						<Bold>ESLint</Bold> for linting as well. Designed the
						app with extra care for it to comply with Material
						Design Guidelines.
					</TextContent>
					<TextContent>
						<br />
						Note: You may not be able to view live preview due to
						Expo servers' availablity.
					</TextContent>
				</ContainerColumn>
				<ContainerColumn>
					<img src={SpotifyCloneImg} alt="Project 2" />
					<CenterTitle>Spotify Clone</CenterTitle>
					<TextContent>
						Fetches songs from API, lists and streams on demand.
						Used <i className="fab fa-react"></i> <Bold>React</Bold>
						, <Bold>TypeScript</Bold> and <Bold>Storybook</Bold> for
						frontend. Also designed front-end with{' '}
						<i className="fab fa-figma"></i> <Bold>Figma</Bold>.
						Used <Bold>ExpressJS</Bold>, <Bold>Mongoose</Bold>,{' '}
						<Bold>Babel</Bold> and <Bold>NodeJS</Bold> for backend.
					</TextContent>
					<TextContent>
						<br />
						Guest creditentals: <br />
						email: guest@guest.com
						<br /> password: guestguest
						<br />
						<br /> <Bold>Note:</Bold> Live server might respond with
						relative amount of delay since server is hosted on
						Heroku.
					</TextContent>
				</ContainerColumn>
				<ContainerColumn>
					<img src={AirtableCMSImg} alt="Project 3" />
					<CenterTitle>Airtable Powered Static Site</CenterTitle>
					<TextContent>
						Gets data from Airtable and generates a static site.
						Every entry in Airtable is a section in the site. Built
						with <Bold>Gatsby</Bold>, <Bold>TypeScript</Bold> and{' '}
						<Graphql style={{ display: 'inline-block' }}></Graphql>{' '}
						<Bold>GraphQL</Bold>.
					</TextContent>
				</ContainerColumn>
			</Container>
		</div>
	);
}

export default App;
