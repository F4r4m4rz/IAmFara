import { ArrowRight, Text } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card/Card";

export function BlogCard() {
  const navigate = useNavigate();
  return (
    <Card
      icon={<Text className="h-6 w-6" />}
      title="Blogs"
      description="Thoughts, guides, and dev explorations"
      button={
        <button
          onClick={() => navigate("/blogs")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
        >
          Read the blog <ArrowRight className="h-4 w-4" />
        </button>
      }
    />
  );
}
