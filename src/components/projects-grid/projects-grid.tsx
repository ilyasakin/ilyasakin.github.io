import './projects-grid.scss';
import ProjectCard from '../project-card';
import Project from '../../types/project';
import kebabCase from 'kebab-case';

interface Props {
  projects: Project[];
}

const ProjectsGrid: React.FC<Props> = ({ projects }) => {
  return (
    <div className="projects-grid">
      {projects.map((project, index) => {
        return (
          <ProjectCard project={project} key={`project-${index}-${kebabCase(project.TITLE)}`} />
        );
      })}
    </div>
  );
};

export default ProjectsGrid;
