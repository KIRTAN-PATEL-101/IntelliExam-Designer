import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, GraduationCap } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import axios from 'axios';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'More Info', path: '/more-info' },
    { name: 'Contact', path: '/contact' },
    { name: 'Pricing', path: '/pricing-page' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // 🔹 Logout handler that also clears cookies in backend
  const handleLogout = async () => {
    // const handleLogout = async () => {
  await logout();      // this now also calls backend + clears state
  navigate("/signin"); // redirect to login page
    // }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 gradient-primary rounded-xl group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              IntelliExam Designer
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'text-primary font-medium'
                    : 'text-gray-600 hover:text-primary hover:bg-accent/50'
                }`}
              >
                {item.name}
                {isActive(item.path) && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-primary rounded-full" />
                )}
              </Link>
            ))}

            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="hover:bg-accent">
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={handleLogout}
                    className="hover:opacity-80"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/signin">
                    <Button variant="ghost" size="sm" className="hover:bg-accent">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="gradient-primary text-white hover:opacity-90 transition-opacity">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-white/20">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-primary font-medium bg-accent/50'
                      : 'text-gray-600 hover:text-primary hover:bg-accent/50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/signin" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsOpen(false)}>
                      <Button size="sm" className="w-full gradient-primary text-white">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
