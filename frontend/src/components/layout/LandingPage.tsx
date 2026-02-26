"use client";

import { useRef, useState } from "react";
import { useAppState } from "@/store/useAppState";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2, MousePointer2, FileUp, ArrowRight, Library, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function LandingPage() {
  const { addDocument } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
        if (file && file.type === "application/pdf") {
            const url = URL.createObjectURL(file);
            const id = Math.random().toString(36).substr(2, 9);
            addDocument({
                id,
                name: file.name,
                url
            });
        }
    });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-6 sm:p-12 md:p-24 overflow-x-hidden">
      {/* Anthropic-style Top Nav */}
      <nav className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-8 md:px-16 z-50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif italic font-bold">M</div>
            <span className="font-serif italic text-xl font-bold tracking-tight">MarginStudio</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Research</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <Link href="/login">
                <Button variant="outline" className="rounded-full border-border hover:bg-secondary">Sign In</Button>
            </Link>
        </div>
      </nav>

      <div className="max-w-5xl w-full mt-20 space-y-24 relative z-10">
        
        {/* Hero Section */}
        <div className="space-y-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 text-foreground text-xs font-bold tracking-[0.2em] uppercase border border-border/50 animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Generative Document Analysis</span>
          </div>
          
          <h1 className="text-6xl md:text-[5.5rem] font-serif italic font-bold tracking-tight text-foreground leading-[1] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
            A new era of <br />
            <span className="relative inline-block text-primary">
              intelligence
              <svg className="absolute -bottom-2 left-0 w-full h-2 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
            </span>
            {" "}in research.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-sans font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            Analyze complex materials with surgical precision. 
            MarginStudio brings the world's most capable models directly to your margins.
          </p>
        </div>

        {/* The "Terminal" Upload Area */}
        <div 
          className={cn(
            "group relative max-w-3xl mx-auto rounded-[2rem] border transition-all duration-700 animate-in fade-in scale-in-95 duration-1000 delay-300 shadow-2xl overflow-hidden",
            isDragging 
              ? "border-primary bg-primary/5 scale-[1.02]" 
              : "border-border bg-card hover:border-primary/30"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            className="hidden" 
            accept="application/pdf"
            multiple
            ref={fileInputRef}
            onChange={onFileChange}
          />
          
          <div className="p-12 md:p-20 flex flex-col items-center justify-center space-y-8">
            <div className={cn(
              "p-6 rounded-2xl bg-secondary transition-all duration-500",
              isDragging ? "bg-primary text-primary-foreground rotate-12" : "text-muted-foreground group-hover:text-primary"
            )}>
              <FileUp className="w-10 h-10" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-serif italic font-bold">
                {isDragging ? "Ready for analysis" : "Import your document"}
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                Drop PDF here or click to select
              </p>
            </div>
            
            <Button size="lg" className="h-14 px-10 rounded-full font-bold text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0">
              Launch Workspace
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Subtle Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-16">
          {[
            {
              icon: <Library className="w-5 h-5" />,
              title: "Surgical Precision",
              desc: "Deep document understanding that reads between the lines."
            },
            {
              icon: <Zap className="w-5 h-5" />,
              title: "Instant Insight",
              desc: "From complex PDFs to structured insights in seconds."
            },
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              title: "Privacy First",
              desc: "Enterprise-grade security for your most sensitive research."
            }
          ].map((item, i) => (
            <div key={i} className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${500 + i * 100}ms` }}>
              <div className="text-primary">{item.icon}</div>
              <h4 className="text-lg font-serif italic font-bold tracking-tight">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-40 pt-12 border-t border-border w-full max-w-5xl flex flex-col md:flex-row justify-between items-center gap-8 text-xs font-bold tracking-widest text-muted-foreground/60 uppercase">
        <div>© 2026 MarginStudio AI</div>
        <div className="flex gap-8">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Status</a>
        </div>
      </footer>
    </div>
  );
}
