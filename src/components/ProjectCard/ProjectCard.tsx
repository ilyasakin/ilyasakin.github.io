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
        <source srcSet={project.IMAGES.AVIF} type="image/avif" />
        <img
          className="project-card-image"
          src={project.IMAGES.PNG}
          loading="lazy"
          decoding="async"
          alt={project.TITLE}
        />
      </picture>
      <div className="project-card-content">
        <div className="project-card-content-title">{project.TITLE}</div>
        <div className="project-card-content-text">
          {project.DESCRIPTION.split('\n').map((line) => {
            return <div>{`${line}`}</div>;
          })}
        </div>
      </div>
      <div className="project-card-links">
        <IconLink
          Icon={Github}
          height="1.5rem"
          width="1.5rem"
          ariaLabel="Source Code"
          href={project.SOURCE_URL}
        />
        {project.LIVE_URL && (
          <IconLink
            Icon={Globe}
            height="1.5rem"
            width="1.5rem"
            ariaLabel="Source Code"
            href={project.LIVE_URL}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
