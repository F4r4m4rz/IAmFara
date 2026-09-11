import { ArrowRight, Contact } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card/Card";

export function ContactCard() {
  const navigate = useNavigate();
  return (
    <Card
      icon={<Contact className="h-6 w-6" />}
      title="Contact"
      description="Let's talk — I'm just one click away"
      button={
        <button
          onClick={() => navigate("/contact")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
        >
          Get in touch <ArrowRight className="h-4 w-4" />
        </button>
      }
    />
  );
}
