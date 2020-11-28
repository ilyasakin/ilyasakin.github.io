import React from 'react';
import Container from './components/Container';
import IconButton from './components/IconButton';
import ReactTypingEffect from 'react-typing-effect';
import ContainerColumn from './components/ContainerColumn';
import CenterTitle from './components/CenterTitle';
import { Github, Linkedin, Mail, Resume } from './components/icons';
import './App.css';
import CarCalendarImg from './assets/images/callendar-app.png';
import SpotifyCloneImg from './assets/images/spotify-clone.png';
import AirtableCMSImg from './assets/images/airtable-pss.png';

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
				</ContainerColumn>
				<ContainerColumn>
					<img src={SpotifyCloneImg} alt="Project 2" />
					<CenterTitle>Spotify Clone</CenterTitle>
				</ContainerColumn>
				<ContainerColumn>
					<img src={AirtableCMSImg} alt="Project 3" />{' '}
					<CenterTitle>Airtable Powered Static Site</CenterTitle>
				</ContainerColumn>
			</Container>
		</div>
	);
}

export default App;
