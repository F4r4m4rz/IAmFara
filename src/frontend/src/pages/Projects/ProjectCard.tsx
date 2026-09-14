import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card/Card";
import { dirFor, T, useLocale } from "../../i18n";
import { isRecentlyAdded, ProjectEntry } from "./projectsData";

const KIND_LABEL_KEY: Record<ProjectEntry["kind"], string> = {
  experiment: "projects.kind.experiment",
  project: "projects.kind.project",
};

export function ProjectCard({ entry }: { entry: ProjectEntry }) {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const isNew = isRecentlyAdded(entry.addedAt);
  const Icon = entry.icon;

  return (
    <Card
      icon={<Icon className="h-6 w-6" />}
      title={entry.title}
      description={
        <>
          <span className="flex flex-wrap items-center justify-center gap-1.5 mb-2">
            <span className="px-2 py-0.5 rounded-full border border-term-purple/50 text-term-purple text-[10px] font-semibold uppercase tracking-wide">
              <T k={KIND_LABEL_KEY[entry.kind]} />
            </span>
            {isNew && (
              <span className="px-2 py-0.5 rounded-full border border-term-green/50 text-term-green text-[10px] font-semibold uppercase tracking-wide">
                <T k="projects.new" />
              </span>
            )}
          </span>
          <T k={entry.descriptionKey} />
          <br />
          <span dir="ltr" className="mt-2 inline-block text-xs text-term-muted/80">
            {entry.tech}
          </span>
        </>
      }
      button={
        <button
          onClick={() => navigate(entry.href)}
          dir={dirFor(locale)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-term-green hover:text-term-blue transition-colors"
        >
          <T k="projects.viewProject" /> <ArrowRight className="h-4 w-4" />
        </button>
      }
    />
  );
}
