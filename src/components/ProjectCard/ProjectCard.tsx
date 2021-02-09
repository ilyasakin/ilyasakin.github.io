import './ProjectCard.scss';
import Project from '../../types/Project';
import IconLink from '../IconLink';
import { Github, Globe } from '../icons';

interface Props {
  project: Project;
}

const ProjectCard: React.FC<Props> = ({ project }) => {
  console.log(project);
  return (
    <div className="project-card">
      <picture>
        <source srcSet={project.images.avif} type="image/avif" />
        <img
          className="project-card-image"
          src={project.images.png}
          loading="lazy"
          decoding="async"
          alt={project.title}
        />
      </picture>
      <div className="project-card-content">
        <div className="project-card-content-title">{project.title}</div>
        <div className="project-card-content-text">{project.title}</div>
      </div>
      <div className="project-card-links">
        <IconLink
          Icon={Github}
          height="1.5rem"
          width="1.5rem"
          ariaLabel="Source Code"
          href={project.sourceUrl}
        />
        {project.liveUrl && (
          <IconLink
            Icon={Globe}
            height="1.5rem"
            width="1.5rem"
            ariaLabel="Source Code"
            href={project.liveUrl}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
