import Header from './components/Header';
import Hero from './components/Hero';
import ProjectsGrid from './components/ProjectsGrid';
import Footer from './components/Footer';

import links from './content/Links';
import projects from './content/Projects';
import './styles/App.scss';

const App = () => {
  return (
    <div className="main">
      <Header />
      <div className="content">
        <Hero
          title="Hi, I’m İlyas Akın, a software developer."
          text="Currently I’m working at DOGO as Front-end Developer"
          links={links}
        />
        <ProjectsGrid projects={projects} />
      </div>
      <Footer />
    </div>
  );
};

export default App;
