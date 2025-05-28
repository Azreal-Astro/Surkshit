
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import MainPage from "./pages/MainPage";
import SettingsPage from "./pages/SettingsPage";
import HelpSentPage from "./pages/HelpSentPage";
import "./styles/global.css";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <div className="min-h-screen bg-gray-900 text-white">
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help-sent" element={<HelpSentPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
