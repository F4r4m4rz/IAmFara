import { ArrowRight, Text } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card/Card";
import { T } from "../../i18n";

export function BlogCard() {
  const navigate = useNavigate();
  return (
    <Card
      icon={<Text className="h-6 w-6" />}
      title="Blogs"
      description={<T k="card.blogs.description" />}
      button={
        <button
          onClick={() => navigate("/blogs")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-term-green hover:text-term-blue transition-colors"
        >
          <T k="card.blogs.button" /> <ArrowRight className="h-4 w-4" />
        </button>
      }
    />
  );
}
