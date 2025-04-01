import { BlogCard } from "./BlogCard";
import { ContactCard } from "./ContactCard";
import { ProjectsCard } from "./ProjectsCard";

function Home() {
  return (
    <div className={``}>
      <div className="grid-flow-row grid grid-cols-3">
        {/* Picture */}
        <div className="rounded-full w-64 h-64 bg-cyan-400"></div>
        <div className="col-span-2">
          <div className="text-5xl font-bold text-gray-800 col-span-2 mt-8 mb-8">
            Hey! I'm Faramarz &#128075;
          </div>
          <span className="text-4xl text-gray-500 col-span-3 mt-4">
            Full-stack developer with a passion for technology, AI and design
          </span>
        </div>
        {/* Description */}
        <div className="col-span-3 mt-8 text-gray-500 text-2xl">
          I’m a self-taught full-stack developer with solid experience in .NET
          and React. Over the years, I’ve built everything from small personal
          tools to large-scale enterprise apps.
          <br />
        </div>
      </div>
      <div className="grid-flow-row grid grid-cols-3 mt-10">
        <ProjectsCard />
        <BlogCard />
        <ContactCard />
      </div>
    </div>
  );
}

export default Home;
