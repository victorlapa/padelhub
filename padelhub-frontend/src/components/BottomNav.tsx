import { Home, Users, User } from "lucide-react";
import { Link, useLocation } from "react-router";

export default function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-t border-gray-200 bg-white px-4 py-2">
      <div className="mx-auto flex max-w-md items-center justify-around">
        <Link
          to="/app"
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            isActive("/app")
              ? "text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          <Home size={24} />
          <span className="text-xs">Home</span>
        </Link>
        <Link
          to="/app/match"
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            isActive("/app/match")
              ? "text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          <Users size={24} />
          <span className="text-xs">Match</span>
        </Link>
        <Link
          to="/app/profile"
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            isActive("/app/profile")
              ? "text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          <User size={24} />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
