"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, Github } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-12">
      {/* Auth Card */}
      <div className="w-full max-w-md space-y-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="flex flex-col items-center text-center space-y-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif italic font-bold text-xl transition-transform group-hover:rotate-6">M</div>
            <span className="font-serif italic text-2xl font-bold tracking-tight">MarginStudio</span>
          </Link>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-serif italic font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground font-medium">Continue your research journey with intelligence.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1" htmlFor="email">Email Address</label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@university.edu" 
                className="h-12 rounded-xl bg-secondary border-border border-2 focus-visible:ring-primary font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1" htmlFor="password">Password</label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="h-12 rounded-xl bg-secondary border-border border-2 focus-visible:ring-primary font-medium"
              />
            </div>
          </div>

          <Button className="w-full h-12 rounded-full font-bold text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px]">
            Sign In
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-background px-4 text-muted-foreground/60">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Button variant="outline" className="h-12 rounded-full border-border border-2 hover:bg-secondary flex items-center gap-3 font-bold">
              <Github className="w-5 h-5" />
              Github
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 font-medium">
          By continuing, you agree to MarginStudio's <br /> 
          <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
        </p>

        <div className="text-center">
            <Link href="/" className="text-sm font-bold text-primary hover:underline">
                Back to Home
            </Link>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/3 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>
    </div>
  );
}
