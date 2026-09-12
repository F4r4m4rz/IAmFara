import {
  ArrowRight,
  Download,
  Github,
  Linkedin,
  Mail,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AvatarBadge } from "./AvatarBadge";
import { BlogCard } from "./BlogCard";
import { ContactCard } from "./ContactCard";
import { ProjectsCard } from "./ProjectsCard";
import { TechStackCard } from "./TechStackCard";

const stats = [
  { label: "years_of_experience", value: "6+" },
  { label: "projects_shipped", value: "20+" },
  { label: "happy_clients", value: "12" },
  { label: "cups_of_coffee", value: "Infinity" },
];

const socialLinks = [
  { label: "github", href: "https://github.com/f4r4m4rz", icon: Github },
  {
    label: "linkedin",
    href: "https://linkedin.com/in/faramarz",
    icon: Linkedin,
  },
  { label: "email", href: "mailto:hello@iamfara.com", icon: Mail },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-16">
      {/* Hero — terminal window */}
      <section className="rounded-lg border border-term-border bg-term-panel shadow-2xl overflow-hidden">
        {/* Window titlebar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-term-border bg-term-bg/60">
          <span className="w-3 h-3 rounded-full bg-term-pink" />
          <span className="w-3 h-3 rounded-full bg-term-orange" />
          <span className="w-3 h-3 rounded-full bg-term-green" />
          <span className="ml-2 text-xs text-term-muted">
            faramarz@iamfara: ~
          </span>
        </div>

        <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-2 flex justify-center">
            <div className="relative">
              <AvatarBadge />
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-term-bg border border-term-border text-xs font-medium text-term-green px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-term-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-term-green"></span>
                </span>
                open --to-work
              </span>
            </div>
          </div>

          <div className="md:col-span-3 text-sm sm:text-base">
            <div className="flex items-center gap-2 text-term-muted">
              <span className="text-term-green">$</span>
              <span>whoami</span>
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-term-text">
              <span className="text-term-blue">Faramarz</span>
              <span className="text-term-muted">.dev</span>
              <span className="inline-block w-2.5 h-6 sm:h-8 bg-term-green ml-2 align-middle animate-caret" />
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-term-orange font-medium">
              <span className="text-term-muted">&gt;</span> full-stack
              developer crafting things for the web
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs sm:text-sm text-term-muted">
              <MapPin className="h-3.5 w-3.5" /> Oslo, Norway
            </p>

            <div className="mt-6 flex items-center gap-2 text-term-muted">
              <span className="text-term-green">$</span>
              <span>cat about.md</span>
            </div>
            <p className="mt-2 text-term-text/90 leading-relaxed max-w-2xl border-l-2 border-term-border pl-4">
              I'm a self-taught full-stack developer based in Norway with a
              strong background in .NET and React. I care about clean,
              maintainable code and building products that feel great to use
              — lately I've been diving deep into AI-assisted tooling and
              modern web architecture.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/projects")}
                className="inline-flex items-center gap-2 bg-term-green text-term-bg font-semibold px-5 py-2.5 rounded hover:bg-term-blue transition-colors"
              >
                ./view-work.sh <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="inline-flex items-center gap-2 border border-term-border text-term-text font-semibold px-5 py-2.5 rounded hover:border-term-green hover:text-term-green transition-colors"
              >
                ./get-in-touch.sh
              </button>
              <a
                href="/resume.pdf"
                className="inline-flex items-center gap-2 text-term-muted font-medium px-3 py-2.5 hover:text-term-text transition-colors"
              >
                <Download className="h-4 w-4" /> resume.pdf
              </a>
            </div>

            <div className="mt-6 flex items-center gap-4">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-term-muted hover:text-term-green transition-colors"
                >
                  <Icon className="h-4 w-4" /> {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Stats — command output */}
        <div className="border-t border-term-border px-6 sm:px-10 py-6">
          <div className="flex items-center gap-2 text-term-muted text-sm sm:text-base">
            <span className="text-term-green">$</span>
            <span>cat stats.json</span>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-term-purple">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-term-muted break-words">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
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
