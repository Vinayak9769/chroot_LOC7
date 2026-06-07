import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  FileText,
  Map,
  User,
  User2Icon,
  LogOutIcon,
  AlertTriangle,
  MessageCircle,
  Siren,
  FlagTriangleRight,
  ShieldCheck,
  Phone,
  ChartNetwork,
} from "lucide-react";
import UserImg from "../assets/user.png";
import { jwtDecode } from "jwt-decode";

interface NavLink {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const commonNavLinks: NavLink[] = [
  { path: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
  { path: "/map", label: "Map", icon: <Map className="h-5 w-5" /> },
];

const officerNavLinks: NavLink[] = [
  { path: "/policeprofile", label: "Profile", icon: <User className="h-5 w-5" /> },
  { path: "/cases", label: "Cases", icon: <FileText className="h-5 w-5" /> },
  {
    path: "/chats",
    label: "Chats",
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    path: "/incident/report",
    label: "Reports",
    icon: <Siren className="h-5 w-5" />,
  },
  {
    path: "/performance",
    label: "Performance",
    icon: <ChartNetwork className="h-5 w-5" />,
  },
];

const userNavLinks: NavLink[] = [
  { path: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
  {
    path: "/user/profile",
    label: "Profile",
    icon: <User className="h-5 w-5" />,
  },
  {
    path: "/user/sos",
    label: "SOS",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  {
    path: "/user/report",
    label: "Report an Incident",
    icon: <FlagTriangleRight className="h-5 w-5" />,
  },
  { path: "/map", label: "Map", icon: <Map className="h-5 w-5" /> },
  {
    path: "/user/emergencycontacts",
    label: "Emergency Contacts",
    icon: <Phone className="h-5 w-5" />,
  },
  {
    path: "/user/blogs",
    label: "Safety Tips",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOfficer, setIsOfficer] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [navLinks, setNavLinks] = useState<NavLink[]>(userNavLinks);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token) as any;
        setIsLoggedIn(true);
        setIsOfficer(decoded.is_officer || false);
        setNavLinks(
          decoded.is_officer
            ? [...commonNavLinks, ...officerNavLinks]
            : userNavLinks
        );
      } catch (error) {
        console.error("Invalid token:", error);
        setIsLoggedIn(false);
        setIsOfficer(false);
        setNavLinks(userNavLinks);
      }
    } else {
      setIsLoggedIn(false);
      setIsOfficer(false);
      setNavLinks(userNavLinks);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById("mobile-menu");
      const menuButton = document.getElementById("menu-button");

      if (
        menu &&
        !menu.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("accessToken"));
    };

    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    setIsOfficer(false);
    setIsDropdownOpen(false);
    setNavLinks(userNavLinks);
  };

  return (
    <nav className="bg-white shadow-md relative z-50">
      <div className="max-w-[1450px] mx-auto">
        <div className="px-6 py-5 flex justify-between items-center">
          {/* Mobile menu button */}
          <button
            id="menu-button"
            type="button"
            className="text-gray-500 hover:text-gray-600 focus:outline-none md:hidden mr-4 flex items-center"
            aria-label="toggle menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex justify-center items-center gap-2">
            <Link to={"/"}>
              <div className="flex">
                <button className="flex justify-center items-center w-7 h-7  overflow-hidden">
                  <img
                    src={UserImg}
                    className="h-full w-full cursor-pointer object-cover"
                    alt="User"
                  />
                </button>
                <h2 className="font-bold text-2xl">Copco</h2>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-center items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-800 hover:text-indigo-600 transition duration-150"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {!isLoggedIn ? (
            <Link to={"/user/login"}>
              <button className="text-indigo-600 hover:text-indigo-700 border border-indigo-500 font-medium px-4 py-2 rounded-md transition-colors duration-200 focus:outline-none">
                Log In
              </button>
            </Link>
          ) : (
            <div className="relative">
              <button
                className="ml-4 flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none transition-colors duration-200"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label="User menu"
              >
                <User2Icon className="h-5 w-5 text-gray-700" />
              </button>
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-xl bg-white border border-gray-200 focus:outline-none"
                  tabIndex={0}
                  onBlur={() => setIsDropdownOpen(false)}
                >
                  <div
                    className="py-1"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-indigo-600 w-full text-left"
                      role="menuitem"
                    >
                      <LogOutIcon className="h-4 w-4 mr-2 inline-block align-middle" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 transition-opacity md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <div
          id="mobile-menu"
          className={`fixed top-0 left-0 h-full w-3/4 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <div className="flex justify-center items-center gap-5">
                <button className="flex justify-center items-center w-7 h-7 ml-4 overflow-hidden">
                  <img
                    src={UserImg}
                    className="h-full w-full object-cover"
                    alt="User"
                  />
                </button>
                <h2 className="font-bold text-xl">Copco </h2>
              </div>

              <button
                type="button"
                className="text-gray-600 hover:text-gray-800 transition duration-150"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition duration-150"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  <span className="text-lg font-medium">{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;