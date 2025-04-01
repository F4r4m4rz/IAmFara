import { Contact } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card/Card";

export function ContactCard() {
  const navigate = useNavigate();
  return (
    <Card
      title={
        <>
          <Contact className="h-10 w-10" />
          <div className="text-2xl font-bold text-gray-800">Contact</div>
        </>
      }
      description="Let’s talk – I’m just one click away!"
      button={
        <button
          onClick={() => navigate("/contact")}
          className="border-2 border-gray-700 text-gray-700 py-1 px-4 rounded mt-6 text-base"
        >
          Contact Me
        </button>
      }
    />
  );
}
