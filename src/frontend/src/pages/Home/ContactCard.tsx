import { ArrowRight, Contact } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card/Card";
import { T } from "../../i18n";

export function ContactCard() {
  const navigate = useNavigate();
  return (
    <Card
      icon={<Contact className="h-6 w-6" />}
      title="Contact"
      description={<T k="card.contact.description" />}
      button={
        <button
          onClick={() => navigate("/contact")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-term-green hover:text-term-blue transition-colors"
        >
          <T k="card.contact.button" /> <ArrowRight className="h-4 w-4" />
        </button>
      }
    />
  );
}
