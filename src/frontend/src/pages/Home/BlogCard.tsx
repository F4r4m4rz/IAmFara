import { Text } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card/Card";

export function BlogCard() {
  const navigate = useNavigate();
  return (
    <Card
      title={
        <>
          <Text className="h-10 w-10" />
          <div className="text-2xl font-bold text-gray-800">Blogs</div>
        </>
      }
      description="Thoughts, guides, and dev explorations"
      button={
        <button
          onClick={() => navigate("/blogs")}
          className="border-2 border-gray-700 text-gray-700 py-1 px-4 rounded mt-6 text-base"
        >
          View my blogs
        </button>
      }
    />
  );
}
