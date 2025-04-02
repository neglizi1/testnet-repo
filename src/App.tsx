
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import CreateToken from "./pages/CreateToken";
import TradeTokens from "./pages/TradeTokens"; 
import VerifyToken from "./pages/VerifyToken";
import TokenDashboard from "./pages/TokenDashboard";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";
import Navigation from "./components/Navigation";

// Create a new query client instance
const queryClient = new QueryClient();

const App = () => {
  console.log("App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <div className="flex-grow pt-14">
                <Routes>
                  <Route path="/" element={<Navigate to="/create" replace />} />
                  <Route path="/home" element={<Index />} />
                  <Route path="/create" element={<CreateToken />} />
                  <Route path="/trade" element={<TradeTokens />} />
                  <Route path="/verify" element={<VerifyToken />} />
                  <Route path="/token" element={<TokenDashboard />} />
                  <Route path="/token/:tokenAddress" element={<TokenDashboard />} />
                  <Route path="/migration/:tokenAddress" element={<TokenDashboard />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
