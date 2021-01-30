import './ProjectsGrid.scss';
import ProjectCard from '../ProjectCard';
import Project from '../../types/Project';
import kebabCase from 'kebab-case';

interface Props {
	projects: Project[];
}

const ProjectsGrid: React.FC<Props> = ({ projects }) => {
	return (
		<div className="projects-grid">
			{projects.map((project) => {
				return (
					<ProjectCard
						project={project}
						key={`project-${kebabCase(project.title)}`}
					/>
				);
			})}
		</div>
	);
};

export default ProjectsGrid;
