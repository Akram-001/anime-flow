import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  Heart, 
  User, 
  Play,
  Settings,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/favorites", icon: Heart, label: "Favorites" },
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={logo} alt="AnimeFlow" className="w-10 h-10" />
              <span className="text-xl font-bold gradient-text">AnimeFlow</span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-8">
              {navItems.map(({ path, icon: Icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </NavLink>
              ))}
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/login'}>
                Sign In
              </Button>
              <Button variant="hero" size="sm">
                Get VIP
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src={logo} alt="AnimeFlow" className="w-8 h-8" />
              <span className="text-lg font-bold gradient-text">AnimeFlow</span>
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-white/10 animate-slide-up z-40">
            <div className="p-4 space-y-2">
              {navItems.map(({ path, icon: Icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </NavLink>
              ))}
              
              <div className="pt-4 border-t border-white/10 space-y-2">
                <Button variant="outline" className="w-full justify-start" size="lg" onClick={() => window.location.href = '/login'}>
                  Sign In
                </Button>
                <Button variant="hero" className="w-full justify-start" size="lg">
                  Get VIP
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Navigation (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <NavLink
                key={path}
                to={path}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'animate-scale-in' : ''}`} />
                <span className="text-xs font-medium">{label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </>
  );
};