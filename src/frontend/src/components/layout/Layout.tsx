import { Menu } from "lucide-react";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Link, useLocation } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

const navItems = [
  { label: "Home", path: "/" },
  { label: "Projects", path: "/projects" },
  { label: "Blogs", path: "/blogs" },
  { label: "Contact", path: "/contact" },
];

export default function Layout({ children }: Props) {
  const collapseNav = useMediaQuery({
    query: "(max-width: 800px)",
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
        {/* Left (Logo) */}
        <div className=" text-2xl font-bold tracking-tight">iamfara</div>
        {/* NavBar */}
        {collapseNav ? <CollapsedNavBar /> : <ListNavBar />}
      </nav>
      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-10">{children}</main>
    </div>
  );
}

function ListNavBar() {
  const location = useLocation();
  return (
    <ul className="flex gap-8 text-base font-medium mx-auto absolute left-1/2 -translate-x-1/2">
      {navItems.map((item) => (
        <li key={item.path}>
          <Link
            to={item.path}
            className={`transition-colors duration-200 hover:text-gray-600 ${
              location.pathname === item.path
                ? "text-gray-800 font-semibold"
                : "text-gray-300"
            }`}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function CollapsedNavBar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex items-center gap-4 relative">
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        onClick={() => setOpen(!open)}
      >
        <Menu className="w-6 h-6" />
      </button>
      <div
        className={`absolute right-0 top-12 w-48 bg-white rounded-md shadow-lg z-10 ${
          open ? "" : "hidden"
        }`}
      >
        <ul className="py-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                  location.pathname === item.path
                    ? "bg-gray-100 font-semibold"
                    : ""
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
