import { ArrowRight, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card/Card";

export function ProjectsCard() {
  const navigate = useNavigate();
  return (
    <Card
      icon={<FolderOpen className="h-6 w-6" />}
      title="Projects"
      description="Explore what I've built and what I'm building"
      button={
        <button
          onClick={() => navigate("/projects")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
        >
          View projects <ArrowRight className="h-4 w-4" />
        </button>
      }
    />
  );
}
