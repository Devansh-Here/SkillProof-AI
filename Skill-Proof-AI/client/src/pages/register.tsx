import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/layout";
import { Loader2 } from "lucide-react";

export default function Register() {
  const { register, isRegistering } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(formData, {
      onSuccess: () => setLocation("/login"),
    });
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white shadow-xl shadow-black/5 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join SkillProof to test your abilities</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                required
                placeholder="Choose a username"
                className="h-11 rounded-lg"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="Choose a password"
                className="h-11 rounded-lg"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 rounded-lg text-base font-semibold shadow-lg shadow-primary/25"
              disabled={isRegistering}
            >
              {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
