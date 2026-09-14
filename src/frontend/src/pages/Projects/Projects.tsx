import { ProjectCard } from "./ProjectCard";
import { PROJECTS } from "./projectsData";

function Projects() {
  return (
    <section className="flex flex-wrap justify-center gap-6">
      {PROJECTS.map((entry) => (
        <ProjectCard key={entry.id} entry={entry} />
      ))}
    </section>
  );
}

export default Projects;
