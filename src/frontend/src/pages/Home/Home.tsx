import { BlogCard } from "./BlogCard";
import { ContactCard } from "./ContactCard";
import { ProjectsCard } from "./ProjectsCard";
import { TechStackCard } from "./TechStackCard";

function Home() {
  return (
    <div>
      <div className="grid-flow-row grid grid-cols-1 md:grid-cols-3 ">
        {/* Picture */}
        <div className="flex justify-center">
          <img
            src="/myPic.png"
            alt="Faramarz"
            className="rounded-full w-48 sm:w-64"
          />
        </div>
        <div className="sm:col-span-2">
          <div className="text-3xl justify-self-center sm:text-5xl font-bold text-gray-800 col-span-2 mt-8 mb-8">
            Hey! I'm Faramarz &#128075;
          </div>
          <span className="text-2xl text-center block mx-auto sm:text-4xl text-gray-500 col-span-3 mt-4">
            Full-stack developer with a passion for technology, AI and design
          </span>
          {/* Description */}
          <div className="col-span-3 mt-8 text-gray-500 text-2xl hidden sm:block">
            I’m a self-learned full-stack developer based in Norway with several
            years of web development experience. I have a strong background in
            .NET technologies and React and have worked on a range of projects,
            from small websites to large-scale web applications.
            <br />
          </div>
        </div>
      </div>
      <div className="grid-flow-row grid grid-cols-1 mt-10">
        <TechStackCard />
      </div>
      <div className="grid-flow-row grid-cols-3 mt-10 justify-items-center hidden sm:grid">
        <ProjectsCard />
        <BlogCard />
        <ContactCard />
      </div>
    </div>
  );
}

export default Home;
