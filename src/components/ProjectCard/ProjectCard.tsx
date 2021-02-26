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
      <picture className="project-card-image">
        <source srcSet={`${project.IMAGES.AVIF[480]}, 480w`} type="image/avif" />
        <source srcSet={`${project.IMAGES.AVIF[720]}, 720w`} type="image/avif" />
        <source srcSet={`${project.IMAGES.AVIF[1080]}, 1080w`} type="image/avif" />

        <source srcSet={`${project.IMAGES.JPG[480]}, 480w`} type="image/jpeg" />
        <source srcSet={`${project.IMAGES.JPG[720]}, 720w`} type="image/jpeg" />
        <source srcSet={`${project.IMAGES.JPG[1080]}, 1080w`} type="image/jpeg" />

        <img
          className="project-card-image"
          src={project.IMAGES.JPG[480]}
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
            ariaLabel="Live Demo"
            href={project.LIVE_URL}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
