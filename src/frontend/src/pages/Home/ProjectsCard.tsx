import { FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card/Card";

export function ProjectsCard() {
  const navigate = useNavigate();
  return (
    <Card
      title={
        <>
          <FolderOpen className="h-10 w-10" />
          <div className="text-2xl font-bold text-gray-800">Projects</div>
        </>
      }
      description="Explore what I’ve built and what I’m building"
      button={
        <button
          onClick={() => navigate("/projects")}
          className="border-2 border-gray-700 text-gray-700 py-1 px-4 rounded mt-6 text-base"
        >
          View Projects
        </button>
      }
    />
  );
}
