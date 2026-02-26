"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Moon, Sun, Monitor, LogOut, LayoutGrid, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const { setTheme } = useTheme();
  const { 
    documents, activeDocumentId, setActiveDocument,
    workspaces, activeWorkspaceId, setActiveWorkspace
  } = useAppState();

  const activeDoc = documents.find(d => d.id === activeDocumentId);
  const activeWS = workspaces.find(w => w.id === activeWorkspaceId);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-6 md:px-8 z-50 sticky top-0 transition-all duration-300">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-serif italic font-bold group-hover:scale-105 transition-all shadow-lg shadow-primary/20">
            M
            </div>
            <div className="flex flex-col -gap-1">
              <span className="text-lg font-serif italic font-bold tracking-tight text-foreground leading-tight">
                  MarginStudio
              </span>
            </div>
        </Link>

        <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />

        {/* Workspace Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-3 rounded-xl hover:bg-secondary font-black text-[10px] uppercase tracking-[0.15em] text-muted-foreground/80">
              <LayoutGrid className="h-3.5 w-3.5 text-primary/60" />
              {activeWS?.name || "Workspace"}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-xl p-2 border-border shadow-2xl backdrop-blur-xl w-56">
            <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Your Workspaces</div>
            {workspaces.map(ws => (
              <DropdownMenuItem key={ws.id} onClick={() => setActiveWorkspace(ws.id)} className="rounded-lg gap-2 font-bold text-xs p-3">
                <div className={cn("w-1.5 h-1.5 rounded-full", ws.id === activeWorkspaceId ? "bg-primary" : "bg-transparent")} />
                {ws.name}
              </DropdownMenuItem>
            ))}
            <div className="border-t border-border/50 my-1" />
            <DropdownMenuItem className="rounded-lg gap-2 font-bold text-xs p-3 text-primary">
              <Plus className="h-3.5 w-3.5" /> NEW WORKSPACE
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Document Selector (Horizontal Tabs) */}
      <div className="flex-1 flex items-center justify-center px-8 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-2xl border border-border/40">
           {documents.map(doc => (
             <button
               key={doc.id}
               onClick={() => setActiveDocument(doc.id)}
               className={cn(
                 "flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap",
                 activeDocumentId === doc.id 
                  ? "bg-background text-foreground shadow-sm border border-border/50" 
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-background/40"
               )}
             >
               <FileText className={cn("h-3 w-3", activeDocumentId === doc.id ? "text-primary" : "text-muted-foreground/40")} />
               {doc.name}
             </button>
           ))}
           <button className="p-1.5 rounded-xl hover:bg-background/60 text-muted-foreground/40 hover:text-primary transition-all">
              <Plus className="h-3.5 w-3.5" />
           </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl w-9 h-9 hover:bg-secondary transition-colors">
              <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl p-1.5 border-border shadow-2xl backdrop-blur-xl">
            <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-lg gap-3 font-semibold text-xs">
              <Sun className="h-3.5 w-3.5" /> LIGHT
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-lg gap-3 font-semibold text-xs">
              <Moon className="h-3.5 w-3.5" /> DARK
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")} className="rounded-lg gap-3 font-semibold text-xs">
              <Monitor className="h-3.5 w-3.5" /> SYSTEM
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-border/60 mx-1" />

        <div className="flex items-center gap-4">
            <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors font-black uppercase tracking-[0.15em] text-[10px] hidden lg:block">
                Sign In
            </Link>

            <button 
                onClick={() => setActiveDocument(null)}
                className="text-muted-foreground hover:text-destructive transition-colors hidden sm:flex items-center gap-2 font-black uppercase tracking-[0.15em] text-[10px] group"
            >
                <LogOut className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Exit
            </button>
        </div>

        <Avatar className="h-9 w-9 border border-border shadow-sm ring-2 ring-background cursor-pointer hover:ring-primary/30 hover:scale-105 transition-all ml-1">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback className="font-bold text-xs">US</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}


