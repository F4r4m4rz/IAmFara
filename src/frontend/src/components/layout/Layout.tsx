import { Link, useLocation } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Projects", path: "/projects" },
    { label: "Blogs", path: "/blogs" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
        {/* Left (Logo) */}
        <div className=" text-2xl font-bold tracking-tight">iamfara</div>

        {/* Center (Nav) */}
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
      </nav>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-10">{children}</main>
    </div>
  );
}
