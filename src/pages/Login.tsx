import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(username);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUsername(loginUsername)) {
      toast({
        title: 'Invalid Username',
        description: 'Username can only contain letters, numbers, and underscores',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const email = `${loginUsername}@miaoda.com`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: loginPassword,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in',
        });
        navigate('/');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid username or password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUsername(signupUsername)) {
      toast({
        title: 'Invalid Username',
        description: 'Username can only contain letters, numbers, and underscores',
        variant: 'destructive',
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (!signupFullName.trim()) {
      toast({
        title: 'Invalid Name',
        description: 'Please enter your full name',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const email = `${signupUsername}@miaoda.com`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password: signupPassword,
        options: {
          data: {
            full_name: signupFullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: 'Account Created!',
          description: 'Welcome to Brain Guard. You are now logged in.',
        });
        navigate('/');
      }
    } catch (error: unknown) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup Failed',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-16 h-16 text-primary" />
            <h1 className="text-4xl xl:text-5xl font-bold text-foreground">Brain Guard</h1>
          </div>
          <p className="text-senior-lg text-muted-foreground">
            Your cognitive health monitoring companion
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-senior-xl text-center">Welcome</CardTitle>
            <CardDescription className="text-senior text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-senior-lg">
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-senior-lg">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-username" className="text-senior-lg">
                      Username
                    </Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter your username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      required
                      className="text-senior h-14"
                      disabled={isLoading}
                    />
                    <p className="text-sm text-muted-foreground">
                      Letters, numbers, and underscores only
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-senior-lg">
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="text-senior h-14"
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full btn-senior"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname" className="text-senior-lg">
                      Full Name
                    </Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      required
                      className="text-senior h-14"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-senior-lg">
                      Username
                    </Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose a username"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      required
                      className="text-senior h-14"
                      disabled={isLoading}
                    />
                    <p className="text-sm text-muted-foreground">
                      Letters, numbers, and underscores only
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-senior-lg">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Choose a password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      className="text-senior h-14"
                      disabled={isLoading}
                    />
                    <p className="text-sm text-muted-foreground">
                      Minimum 6 characters
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full btn-senior"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    The first user to sign up will become the administrator
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-senior text-muted-foreground">
            Brain Guard helps you monitor and maintain your cognitive health
          </p>
        </div>
      </div>
    </div>
  );
}
