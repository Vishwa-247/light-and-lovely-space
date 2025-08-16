
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
  const [isAutoDemoLogin, setIsAutoDemoLogin] = useState(false);
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

  // Auto-fill and submit demo login credentials
  useEffect(() => {
    if (isAutoDemoLogin && !isLoading) {
      // Generate random user credentials
      const randomName = `demo${Math.floor(Math.random() * 1000)}`;
      const randomEmail = `${randomName}@example.com`;
      const randomPassword = `demo${Math.floor(Math.random() * 1000000)}`;

      if (activeTab === "login") {
        // Set form values and mark as touched
        loginForm.setValue("email", randomEmail);
        loginForm.setValue("password", randomPassword);
        
        // Show a loading toast
        toast({
          title: "Demo Mode Active",
          description: `Signing in with ${randomEmail}...`,
        });
        
        // Submit the login form after a brief delay to show the filled fields
        const timer = setTimeout(() => {
          handleDemoLogin();
        }, 800);
        
        return () => clearTimeout(timer);
      } else {
        // Fill the signup form
        signupForm.setValue("fullName", `Demo User ${randomName}`);
        signupForm.setValue("email", randomEmail);
        signupForm.setValue("password", randomPassword);
        signupForm.setValue("confirmPassword", randomPassword);
        
        // Show a loading toast
        toast({
          title: "Demo Mode Active",
          description: `Creating demo account with ${randomEmail}...`,
        });
        
        // Submit the signup form after a brief delay
        const timer = setTimeout(() => {
          signupForm.handleSubmit(onSignupSubmit)();
        }, 800);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isAutoDemoLogin, activeTab, isLoading]);

  // Auto-initiate demo login when page loads
  useEffect(() => {
    // Start demo login process after a short delay
    const timer = setTimeout(() => {
      setIsAutoDemoLogin(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const onLoginSubmit = async (values: LoginFormValues) => {
    try {
      await signIn(values.email, values.password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const onSignupSubmit = async (values: SignupFormValues) => {
    try {
      await signUp(values.email, values.password, values.fullName);
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  const handleDemoLogin = async () => {
    try {
      const randomEmail = `demo${Math.floor(Math.random() * 1000)}@example.com`;
      const randomPassword = "password123";
      await signIn(randomEmail, randomPassword);
      navigate("/dashboard");
    } catch (error) {
      console.error("Demo login failed:", error);
    }
  };

  // Trigger auto demo login
  const triggerAutoDemoLogin = () => {
    setIsAutoDemoLogin(true);
  };

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
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
            <div className="text-center mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
              <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-400 mb-1">
                <Info className="h-4 w-4" />
                <span className="font-medium">Demo Mode Active</span>
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-300">
                Auto-signing you in to explore all features. Please wait a moment...
              </p>
            </div>
            
            <Tabs value={activeTab} onValueChange={(val: string) => setActiveTab(val as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome to StudyMate</CardTitle>
                    <CardDescription>Enter any details to sign in or wait for auto-login</CardDescription>
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
                                <Input type="password" placeholder="Any password" {...field} />
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
                          onClick={triggerAutoDemoLogin}
                          disabled={isLoading || isAutoDemoLogin}
                        >
                          {isLoading || isAutoDemoLogin ? "Logging in..." : "Quick Demo Login"}
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
                    <CardDescription>Enter any details to create a demo account</CardDescription>
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
                                <Input type="password" placeholder="Any password" {...field} />
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
                                <Input type="password" placeholder="Same as password" {...field} />
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
                          onClick={triggerAutoDemoLogin}
                          disabled={isLoading || isAutoDemoLogin}
                        >
                          {isLoading || isAutoDemoLogin ? "Creating demo account..." : "Quick Demo Login"}
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
