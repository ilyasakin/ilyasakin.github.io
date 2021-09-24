import Header from './components/header';
import Hero from './components/hero';
import ProjectsGrid from './components/projects-grid';
import Footer from './components/footer';

import links from './content/links';
import projects from './content/projects';
import './styles/app.scss';

const App = () => {
  return (
    <div className="main">
      <Header />
      <div className="content">
        <Hero
          title="Hi, I’m İlyas Akın, a software developer."
          text="Currently I’m working at Supply Chain Wizard as Software Developer"
          links={links}
        />
        <ProjectsGrid projects={projects} />
      </div>
      <Footer />
    </div>
  );
};

export default App;
