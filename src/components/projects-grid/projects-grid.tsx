import './projects-grid.scss';
import ProjectCard from '../project-card';
import Project from '../../types/IProject';
import kebabCase from 'kebab-case';
import { InView } from 'react-intersection-observer';
import { usePagination } from '../../context/pagination.context';

interface Props {
  projects: Project[];
}

const ProjectsGrid: React.FC<Props> = ({ projects }) => {
  const { setPagination } = usePagination();

  if (projects.length === 0) {
    return <div>No projects found</div>;
  }

  const onInViewChange = (inView: boolean, entry: IntersectionObserverEntry) => {
    if (!inView) return;

    setPagination({ inView: 'projects' });
  };

  return (
    <InView as="div" threshold={0.7} className="projects-grid" onChange={onInViewChange}>
      {projects.map((project, index) => {
        return (
          <ProjectCard project={project} key={`project-${index}-${kebabCase(project.TITLE)}`} />
        );
      })}
    </InView>
  );
};

export default ProjectsGrid;
