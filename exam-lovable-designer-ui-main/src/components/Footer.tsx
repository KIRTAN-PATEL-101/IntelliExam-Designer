
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 gradient-primary rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                IntelliExam Designer
              </span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              AI-powered intelligent question paper generator designed for educators to create comprehensive, 
              professional examinations with advanced features and seamless workflow.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <Mail className="h-4 w-4 mr-2" />
                contact@intelliexam.com
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/more-info" className="text-gray-600 hover:text-primary transition-colors duration-200">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-primary transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/signin" className="text-gray-600 hover:text-primary transition-colors duration-200">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-200">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-200">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {currentYear} IntelliExam Designer. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm mt-2 md:mt-0">
              Empowering educators with intelligent assessment tools
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
