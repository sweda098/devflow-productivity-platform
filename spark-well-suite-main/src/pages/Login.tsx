import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/services/api";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Use environment variable for API base URL
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleGoogleLogin = () => {
    window.location.href = `${BASE_URL}/api/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${BASE_URL}/api/auth/github`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && !name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    // Email validation for @ and .com
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Email must contain '@' and end with '.com'.",
        variant: "destructive",
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter your password.",
        variant: "destructive",
      });
      return;
    }

    // Password validation for sign-up: must have letters, numbers, special characters
    if (!isLogin) {
      const passwordRegex =
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?/]).{8,}$/;
      if (!passwordRegex.test(password)) {
        toast({
          title: "Weak password",
          description:
            "Password must be at least 8 characters and include letters, numbers, and special characters.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await authAPI.login(email, password);

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });

        // Store token and user data in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/dashboard");
      } else {
        const response = await authAPI.register(name, email, password);

        toast({
          title: "Account created!",
          description:
            "Your account has been created successfully. Please sign in to continue.",
        });

        // Clear form and redirect to login page
        setName("");
        setEmail("");
        setPassword("");
        setIsLogin(true);
        navigate("/login");
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="mb-8 flex items-center gap-3">
            <span className="font-display text-xl font-semibold text-foreground">
              Spark Well Suite
            </span>
          </Link>

          {/* Header */}
          <h1 className="font-display text-3xl font-bold text-foreground">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isLogin
              ? "Sign in to continue tracking your productivity"
              : "Start your productivity journey today"}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="input-focus"
                />
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-focus pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-focus pl-10"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                "Please wait..."
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-primary hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Visual */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden flex-1 items-center justify-center bg-primary p-12 lg:flex"
      >
        <div className="relative max-w-lg text-center">
          {/* Decorative elements */}
          <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-primary-glow/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-primary-glow/30 blur-3xl" />

          <div className="relative">
            <h2 className="mt-6 font-display text-3xl font-bold text-primary-foreground">
              Track Your Progress
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Join thousands of developers who are optimizing their workflow and
              maintaining their well-being with DevFlow.
            </p>

            {/* Feature highlights */}
            <div className="mt-8 space-y-4 text-left">
              {[
                "Smart work journaling with tags and blockers",
                "AI-powered productivity insights",
                "Health and burnout tracking",
                "Auto-generated stand-up reports",
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 p-3"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20">
                    <Sparkles className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <span className="text-sm text-primary-foreground">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
