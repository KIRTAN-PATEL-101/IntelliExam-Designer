import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MoreInfo from "./pages/MoreInfo";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

// Router wrapper to handle auth redirects
const RouterWithRedirectHandler = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleAuthRedirect = (event: any) => {
      const { path } = event.detail;
      navigate(path, { replace: true });
    };
    
    window.addEventListener('auth-redirect', handleAuthRedirect);
    return () => window.removeEventListener('auth-redirect', handleAuthRedirect);
  }, [navigate]);
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/more-info" element={<MoreInfo />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/pricing-page" element={<Pricing/>} />
      <Route path="/forgot-password" element={<ForgotPassword />} /> 
      <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouterWithRedirectHandler />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;