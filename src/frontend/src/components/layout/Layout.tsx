import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Link, useLocation } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

const navItems = [
  { label: "home", path: "/" },
  { label: "projects", path: "/projects" },
  { label: "blogs", path: "/blogs" },
  { label: "contact", path: "/contact" },
];

export default function Layout({ children }: Props) {
  const collapseNav = useMediaQuery({
    query: "(max-width: 800px)",
  });

  return (
    <div className="min-h-screen bg-term-bg text-term-text font-mono">
      {/* Titlebar */}
      <nav className="h-14 bg-term-panel/95 backdrop-blur-sm border-b border-term-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
        {/* Left (traffic lights + path) */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-term-pink" />
            <span className="w-3 h-3 rounded-full bg-term-orange" />
            <span className="w-3 h-3 rounded-full bg-term-green" />
          </div>
          <Link
            to="/"
            className="text-sm sm:text-base font-semibold tracking-tight text-term-text truncate"
          >
            <span className="text-term-green">faramarz</span>
            <span className="text-term-muted">@</span>
            <span className="text-term-blue">iamfara</span>
            <span className="text-term-muted">:~$</span>
          </Link>
        </div>
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
    <ul className="flex gap-6 text-sm">
      {navItems.map((item) => (
        <li key={item.path}>
          <Link
            to={item.path}
            className={`transition-colors duration-200 hover:text-term-green ${
              location.pathname === item.path
                ? "text-term-green font-semibold"
                : "text-term-muted"
            }`}
          >
            <span className="text-term-border">./</span>
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
        className="flex items-center justify-center w-9 h-9 rounded border border-term-border bg-term-bg text-term-text hover:border-term-green hover:text-term-green transition-colors focus:outline-none"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      <div
        className={`absolute right-0 top-12 w-52 bg-term-panel border border-term-border rounded-md shadow-xl z-10 overflow-hidden ${
          open ? "" : "hidden"
        }`}
      >
        <ul className="py-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 text-sm hover:bg-term-bg hover:text-term-green transition-colors ${
                  location.pathname === item.path
                    ? "text-term-green font-semibold"
                    : "text-term-muted"
                }`}
              >
                <span className="text-term-border">./</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
