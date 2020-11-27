import React from 'react';
import Container from './components/Container/Container';
import IconButton from './components/IconButton/IconButton';
import ReactTypingEffect from 'react-typing-effect';

import { Github, Linkedin, Mail, Resume } from './components/icons';
import './App.css';

function App() {
	return (
		<div className="App">
			<Container>
				<div className="flex items-center justify-center w-full h-full">
					<div>
						<div className="text-3xl font-encode-sans font-bold">
							ilyas akın
						</div>
						<ReactTypingEffect
							className="font-encode-sans"
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
		</div>
	);
}

export default App;
