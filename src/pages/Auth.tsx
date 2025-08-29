
import { useState, useEffect } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Container from "@/components/ui/Container";
import GlassMorphism from "@/components/ui/GlassMorphism";
import { ChevronLeft, Info } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const signupSchema = z.object({
  fullName: z.string().min(1, { message: "Name is required" }),
  email: z.string().min(1, { message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
  confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function Auth() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const { signIn, signUp, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleDemoLogin = async () => {
    try {
      const randomEmail = `demo${Math.floor(Math.random() * 1000)}@example.com`;
      const randomPassword = "password123";
      await signIn(randomEmail, randomPassword);
      navigate("/profile-builder");
    } catch (error) {
      console.error("Demo login failed:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Simulate Google OAuth flow
      const googleUser = {
        email: "google.user@gmail.com",
        name: "Google User",
        picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=google",
      };
      
      await signIn(googleUser.email, "google-oauth-token");
      toast({
        title: "Welcome!",
        description: `Signed in with Google as ${googleUser.name}`,
      });
      navigate("/profile-builder");
    } catch (error) {
      console.error("Google sign in failed:", error);
      toast({
        title: "Sign in failed",
        description: "There was an error signing in with Google",
        variant: "destructive",
      });
    }
  };

  const onLoginSubmit = async (values: LoginFormValues) => {
    try {
      await signIn(values.email, values.password);
      navigate("/profile-builder");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const onSignupSubmit = async (values: SignupFormValues) => {
    try {
      await signUp(values.email, values.password, values.fullName);
      navigate("/profile-builder");
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  const triggerDemoLogin = async () => {
    try {
      const randomEmail = `demo${Math.floor(Math.random() * 1000)}@example.com`;
      const randomPassword = "password123";
      await signIn(randomEmail, randomPassword);
      navigate("/profile-builder");
    } catch (error) {
      console.error("Demo login failed:", error);
    }
  };

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/profile-builder" replace />;
  }

  return (
    <>
      {/* Simple Navbar for Auth Page */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-white/90 dark:bg-background/90 backdrop-blur-sm border-b border-border/40 shadow-sm">
        <Container>
          <div className="flex items-center justify-between h-18">
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-bold transition-opacity hover:opacity-80"
            >
              <span className="text-gradient">StudyMate</span>
            </Link>
            
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </div>
        </Container>
      </header>
    
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 pt-24">
        <Container size="sm">
          <GlassMorphism className="w-full">
            
            <Tabs value={activeTab} onValueChange={(val: string) => setActiveTab(val as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome to StudyMate</CardTitle>
                    <CardDescription>
                      Enter your credentials or use demo login
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Any email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <PasswordInput placeholder="Any password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                        
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="bg-card px-2 text-muted-foreground">Or</span>
                          </div>
                        </div>
                        
                         <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full" 
                          onClick={triggerDemoLogin}
                          disabled={isLoading}
                        >
                          {isLoading ? "Logging in..." : "Quick Demo Login"}
                        </Button>
                        
                        <Button 
                          type="button" 
                          variant="secondary" 
                          className="w-full" 
                          onClick={handleGoogleSignIn}
                          disabled={isLoading}
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Continue with Google
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="signup">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>
                      Enter your details or use demo login
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...signupForm}>
                      <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                        <FormField
                          control={signupForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Any name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Any email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <PasswordInput placeholder="Any password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <PasswordInput placeholder="Same as password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                        
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="bg-card px-2 text-muted-foreground">Or</span>
                          </div>
                        </div>
                        
                         <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full" 
                          onClick={triggerDemoLogin}
                          disabled={isLoading}
                        >
                          {isLoading ? "Creating demo account..." : "Quick Demo Login"}
                        </Button>
                        
                        <Button 
                          type="button" 
                          variant="secondary" 
                          className="w-full" 
                          onClick={handleGoogleSignIn}
                          disabled={isLoading}
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Continue with Google
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </GlassMorphism>
        </Container>
      </div>
    </>
  );
}
