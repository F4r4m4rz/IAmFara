import { ArrowRight, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card/Card";
import { dirFor, T, useLocale } from "../../i18n";

export function ProjectsCard() {
  const navigate = useNavigate();
  const { locale } = useLocale();
  return (
    <Card
      icon={<FolderOpen className="h-6 w-6" />}
      title="Projects"
      description={<T k="card.projects.description" />}
      button={
        <button
          onClick={() => navigate("/projects")}
          dir={dirFor(locale)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-term-green hover:text-term-blue transition-colors"
        >
          <T k="card.projects.button" /> <ArrowRight className="h-4 w-4" />
        </button>
      }
    />
  );
}
