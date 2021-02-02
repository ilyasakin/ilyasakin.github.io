import './ProjectCard.scss';
import Project from '../../types/Project';

interface Props {
  project: Project;
}

const ProjectCard: React.FC<Props> = ({ project }) => {
  return (
    <div className="project-card">
      <picture>
        <source srcSet={project.images.avif} type="image/avif" />
        <img className="project-card-image" src={project.images.png} alt="" />
      </picture>
      <div className="project-card-content">
        <div className="project-card-content-title">{project.title}</div>
        <div className="project-card-content-text">{project.title}</div>
      </div>
    </div>
  );
};

export default ProjectCard;
