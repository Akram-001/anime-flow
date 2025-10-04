import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Home } from "./pages/Home";   
import { Search } from "./pages/Search";
import { Favorites } from "./pages/Favorites";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings"; 
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { AnimeDetails } from "./pages/AnimeDetails";
import { Watch } from "./pages/Watch";
import NotFound from "./pages/NotFound";

// ✅ الصفحات الجديدة
import Dashboard from "./pages/Dashboard";
import VIP from "./pages/VIP";
import AccountSettings from "./pages/AccountSettings"; 
import Payment from "./pages/Payment";   // 👈 هذا الناقص

// ✅ Providers
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <SettingsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} /> 
              <Route path="/search" element={<Search />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/anime/:id" element={<AnimeDetails />} />

              {/* ✅ المشاهدة */}
              <Route path="/anime/:animeId/watch/:episodeId" element={<Watch />} />
              
              {/* ✅ الدفع */}
              <Route path="/payment" element={<Payment />} />

              {/* ✅ الصفحات الجديدة */}
              <Route path="/account-settings" element={<AccountSettings />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vip" element={<VIP />} />

              {/* catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SettingsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;