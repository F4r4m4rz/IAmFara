import { ComingSoon } from "../../components/ComingSoon/ComingSoon";
import { SlidingPuzzleCard } from "./SlidingPuzzleCard";

function Projects() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-wrap justify-center gap-6">
        <SlidingPuzzleCard />
      </section>
      <ComingSoon path="~/projects" command="./projects.sh" />
    </div>
  );
}

export default Projects;
