import {
  ArrowRight,
  Download,
  Github,
  Linkedin,
  Mail,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BlogCard } from "./BlogCard";
import { ContactCard } from "./ContactCard";
import { ProjectsCard } from "./ProjectsCard";
import { TechStackCard } from "./TechStackCard";

const stats = [
  { label: "Years of experience", value: "6+" },
  { label: "Projects shipped", value: "20+" },
  { label: "Happy clients", value: "12" },
  { label: "Cups of coffee", value: "∞" },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com/f4r4m4rz", icon: Github },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/faramarz",
    icon: Linkedin,
  },
  { label: "Email", href: "mailto:hello@iamfara.com", icon: Mail },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-20">
      {/* Hero */}
      <section className="grid grid-cols-1 md:grid-cols-5 gap-10 items-center pt-4">
        <div className="md:col-span-2 flex justify-center">
          <div className="relative">
            <img
              src="/myPic.png"
              alt="Faramarz"
              className="rounded-full w-48 h-48 sm:w-64 sm:h-64 object-cover ring-4 ring-white shadow-xl"
            />
            <span className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white text-xs font-semibold text-gray-700 px-3 py-1.5 rounded-full shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Open to work
            </span>
          </div>
        </div>

        <div className="md:col-span-3 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 mb-4">
            <MapPin className="h-4 w-4" />
            Oslo, Norway
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
            Hey, I'm Faramarz <span className="inline-block">👋</span>
          </h1>
          <p className="mt-3 text-xl sm:text-2xl font-medium text-indigo-600">
            Full-stack developer crafting things for the web
          </p>
          <p className="mt-5 text-lg text-gray-500 leading-relaxed max-w-2xl">
            I'm a self-taught full-stack developer based in Norway with a
            strong background in .NET and React. I care about clean,
            maintainable code and building products that feel great to use —
            lately I've been diving deep into AI-assisted tooling and modern
            web architecture.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={() => navigate("/projects")}
              className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold px-6 py-3 rounded-full hover:bg-indigo-600 transition-colors"
            >
              View my work <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-full hover:border-gray-900 transition-colors"
            >
              Get in touch
            </button>
            <a
              href="/resume.pdf"
              className="inline-flex items-center gap-2 text-gray-500 font-semibold px-4 py-3 hover:text-gray-900 transition-colors"
            >
              <Download className="h-4 w-4" /> Resume
            </a>
          </div>

          <div className="mt-6 flex items-center justify-center md:justify-start gap-4">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-500 shadow-sm hover:text-indigo-600 hover:border-indigo-200 transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 bg-gray-900 rounded-2xl px-6 py-10 text-white">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold">
              {stat.value}
            </div>
            <div className="mt-1 text-xs sm:text-sm text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Tech stack */}
      <section>
        <TechStackCard />
      </section>

      {/* Explore cards */}
      <section className="flex flex-wrap justify-center gap-6">
        <ProjectsCard />
        <BlogCard />
        <ContactCard />
      </section>
    </div>
  );
}

export default Home;
