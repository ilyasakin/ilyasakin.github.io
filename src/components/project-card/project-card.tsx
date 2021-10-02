import './project-card.scss';
import Project from '../../types/IProject';
import IconLink from '../icon-link';
import { Github, Globe, Npm } from '../icons';

interface Props {
  project: Project;
}

const ProjectCard: React.FC<Props> = ({ project }) => {
  return (
    <div className="project-card">
      <picture className="project-card-image">
        <source
          srcSet={`${project.IMAGES.AVIF[720]}`}
          media="(min-width: 1024px)"
          type="image/avif"
        />

        <source
          srcSet={`${project.IMAGES.AVIF[1080]}`}
          media="(max-width: 1024px)"
          type="image/avif"
        />

        <source
          srcSet={`${project.IMAGES.JPG[720]}`}
          media="(min-width: 1024px)"
          type="image/jpg"
        />

        <source
          srcSet={`${project.IMAGES.JPG[1080]}`}
          media="(max-width: 1024px)"
          type="image/jpg"
        />

        <img
          className="project-card-image"
          src={project.IMAGES.JPG[720]}
          loading="lazy"
          decoding="async"
          style={{ aspectRatio: '1920 / 1080' }}
          alt={project.TITLE}
        />
      </picture>
      <div className="project-card-content">
        <div className="project-card-content-title">{project.TITLE}</div>
        <div className="project-card-content-text">
          {project.DESCRIPTION.split('\n').map((line, index) => {
            return <div key={`${project.TITLE}_${index}`}>{`${line}`}</div>;
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
            Icon={project.LIVE_URL.type === 'npm' ? Npm : Globe}
            height="1.5rem"
            ariaLabel="Live Demo"
            href={project.LIVE_URL.url}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
