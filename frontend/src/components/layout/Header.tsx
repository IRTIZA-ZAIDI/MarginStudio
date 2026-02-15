"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Moon, Sun, Monitor, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useAppState } from "@/store/useAppState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function Header() {
  const { setTheme, theme } = useTheme();
  const { setFileUrl } = useAppState();

  return (
    <header className="flex h-20 items-center justify-between border-b bg-background px-8 md:px-16 z-50 sticky top-0 transition-colors">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-4 group">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-primary text-primary-foreground font-serif italic font-bold group-hover:rotate-3 transition-transform">
            M
            </div>
            <div className="flex flex-col">
            <span className="text-xl font-serif italic font-bold tracking-tight text-foreground">
                MarginStudio
            </span>
            <span className="text-[10px] items-center gap-1 font-bold text-primary flex uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                System Active
            </span>
            </div>
        </Link>
      </div>

      <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border text-[11px] font-bold uppercase tracking-widest text-muted-foreground transition-all hover:border-primary/30">
        <FileText className="h-3.5 w-3.5 text-primary" />
        <span className="max-w-[150px] truncate">Research Workspace</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-secondary">
              <Sun className="h-[1.2rem] w-[1.2rem] opacity-100 scale-100 transition-all dark:opacity-0 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] opacity-0 scale-0 transition-all dark:opacity-100 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl p-1.5 border-border shadow-2xl">
            <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-lg gap-3 font-medium">
              <Sun className="h-4 w-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-lg gap-3 font-medium">
              <Moon className="h-4 w-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")} className="rounded-lg gap-3 font-medium">
              <Monitor className="h-4 w-4" /> System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-8 bg-border" />

        <div className="flex items-center gap-6">
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors font-bold uppercase tracking-widest text-[10px] hidden md:block">
                Sign In
            </Link>

            <button 
                onClick={() => setFileUrl(null)}
                className="text-muted-foreground hover:text-red-500 transition-colors hidden sm:flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]"
            >
                <LogOut className="h-4 w-4" />
                Exit
            </button>
        </div>

        <Avatar className="h-10 w-10 border border-border shadow-sm ring-2 ring-background cursor-pointer hover:ring-primary/20 transition-all">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback className="font-bold">US</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
