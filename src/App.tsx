import React from 'react';
import Container from './components/Container/Container';
import { Github, Linkedin, Mail, Resume } from './components/icons';
import './App.css';

function App() {
	return (
		<div className="App">
			<Container>
				<div className="flex items-center justify-center w-full h-full">
					<div>
						<div className="text-2xl">ilyas akın</div>
						<hr />
						<div className="flex flex-row justify-between mt-1">
							<Github />
							<Linkedin />
							<Mail />
							<Resume />
						</div>
					</div>
				</div>
			</Container>
		</div>
	);
}

export default App;
