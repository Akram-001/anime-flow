import { Layout } from "@/components/Layout";
import { User, Crown, Shield, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { EditProfileModal } from "@/components/EditProfileModal";

export const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-center text-xl font-bold">
            You are not logged in.
          </h2>
        </div>
      </Layout>
    );
  }

  const isAdmin = user.email === "akramgourri2007@gmail.com"; // ✨ إيميل الأدمن

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="glass border-primary/20 p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                {/* ✅ زر التعديل بمودال */}
                <EditProfileModal />
              </div>
              
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                  <h1 className="text-2xl font-bold">{user.displayName || "User"}</h1>
                  {isAdmin && (
                    <Shield className="w-5 h-5 text-primary" />
                  )}
                </div>
                <p className="text-muted-foreground mb-2">{user.email}</p>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isAdmin
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary/20 text-secondary"
                  }`}>
                    {isAdmin ? "Admin" : "User"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    UID: {user.uid}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="glass border-primary/20 p-6 text-center">
              <h3 className="text-2xl font-bold text-primary mb-2">0</h3>
              <p className="text-muted-foreground">Episodes Watched</p>
            </Card>
            <Card className="glass border-primary/20 p-6 text-center">
              <h3 className="text-2xl font-bold text-primary mb-2">0</h3>
              <p className="text-muted-foreground">Favorite Anime</p>
            </Card>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {isAdmin && (
              <Button asChild variant="hero" className="w-full justify-start" size="lg">
                <Link to="/dashboard">
                  <Shield className="w-5 h-5 mr-3" />
                  Admin Dashboard
                </Link>
              </Button>
            )}
            
            <Button asChild variant="outline" className="w-full justify-start" size="lg">
              <Link to="/account-settings">
                <Settings className="w-5 h-5 mr-3" />
                Account Settings
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start" size="lg">
              <Link to="/vip">
                <Crown className="w-5 h-5 mr-3" />
                Upgrade to VIP
              </Link>
            </Button>
            
            {/* تسجيل خروج */}
            <Button 
              variant="destructive" 
              className="w-full justify-start" 
              size="lg"
              onClick={logout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};