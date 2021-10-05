import Header from './components/header';
import Hero from './components/hero';
import ProjectsGrid from './components/projects-grid';
import ArticlesGrid from './components/articles-grid';
import Footer from './components/footer';
import Spacer from './components/spacer';
import SectionTitle from './components/section-title';
import CompoundProviders from './components/compound-providers';

import links from './content/links';
import projects from './content/projects';
import articles from './content/articles';

import './styles/app.scss';

const App = () => {
  return (
    <CompoundProviders>
      <div className="main">
        <Header />
        <div className="content">
          <Hero
            title="Hi, I’m İlyas Akın, a software developer."
            text="Currently I’m working at Supply Chain Wizard as Software Developer"
            links={links}
          />
          <SectionTitle title="Projects" />
          <ProjectsGrid projects={projects} />
          <Spacer />
          <SectionTitle title="Articles" />
          <ArticlesGrid articles={articles} />
        </div>
        <Footer />
      </div>
    </CompoundProviders>
  );
};

export default App;
