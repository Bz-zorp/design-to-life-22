import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import doctorImg from "@/assets/doctor-illustration.png";
import medicalBg from "@/assets/medical-bg-elements.png";

type Mode = "login" | "signup" | "forgot";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We've sent you a verification link. Please verify your email before signing in." });
      setMode("login");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email sent", description: "Check your email for a password reset link." });
      setMode("login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: "linear-gradient(180deg, hsl(210 60% 95%) 0%, hsl(210 70% 90%) 50%, hsl(210 60% 95%) 100%)"
    }}>
      <div className="w-full max-w-[900px] bg-card rounded-2xl overflow-hidden flex flex-col md:flex-row" style={{ boxShadow: "0 20px 60px -15px hsl(211 70% 50% / 0.15)" }}>
        {/* Left illustration */}
        <div className="hidden md:flex md:w-[45%] relative items-end justify-center px-6 pt-12 pb-0 overflow-hidden" style={{
          background: "linear-gradient(180deg, hsl(210 60% 95%) 0%, hsl(210 65% 88%) 100%)"
        }}>
          <img src={medicalBg} alt="" className="absolute bottom-0 left-0 w-full opacity-40" />
          <img src={doctorImg} alt="Doctor" className="relative z-10 max-h-[340px] object-contain" />
        </div>

        {/* Right form */}
        <div className="flex-1 p-8 lg:p-10">
          <h1 className="text-[26px] font-bold text-foreground mb-2">
            {mode === "login" && "Login to Your Account"}
            {mode === "signup" && "Create Your Account"}
            {mode === "forgot" && "Reset Password"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "login" && "Welcome back! Please enter your details."}
            {mode === "signup" && "Join us to manage your health easily."}
            {mode === "forgot" && "Enter your email to receive a reset link."}
          </p>

          <form onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgotPassword} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-11 h-12 rounded-lg border-border bg-card text-sm"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 h-12 rounded-lg border-border bg-card text-sm"
                required
              />
            </div>

            {mode !== "forgot" && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-20 h-12 rounded-lg border-border bg-card text-sm"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-primary font-semibold hover:underline mr-2"
                  >
                    Forgot?
                  </button>
                )}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-[52px] text-base font-bold rounded-lg medical-gradient border-0">
              {loading ? "Please wait..." : mode === "login" ? "Login" : mode === "signup" ? "Sign Up" : "Send Reset Link"}
            </Button>
          </form>

          <p className="text-center mt-7 text-sm text-muted-foreground">
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-primary font-bold hover:underline">Sign Up</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-primary font-bold hover:underline">Login</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
