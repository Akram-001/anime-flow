import { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Main Content */}
      <main className="pt-16 md:pt-20">
        {children}
      </main>
    </div>
  );
};

export default Layout;