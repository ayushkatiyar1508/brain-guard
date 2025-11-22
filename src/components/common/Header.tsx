import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Brain, LogOut, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/db/supabase";
import { useToast } from "@/hooks/use-toast";
import { profilesApi } from "@/db/api";
import type { Profile } from "@/types/types";
import routes from "../../routes";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const navigation = routes.filter((route) => route.visible !== false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userProfile = await profilesApi.getById(user.id);
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-10 border-b">
      <nav className="max-w-7xl mx-auto px-4 xl:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <Brain className="w-10 h-10 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                Brain Guard
              </span>
            </Link>
          </div>

          <div className="hidden xl:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 text-senior-lg font-medium rounded-md transition-colors ${
                  location.pathname === item.path
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {profile && (
              <>
                {profile.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="outline" className="btn-senior">
                      <Shield className="w-5 h-5 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                
                <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-md">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span className="text-senior font-medium">{profile.full_name}</span>
                </div>
                
                <Button
                  variant="destructive"
                  className="btn-senior"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
