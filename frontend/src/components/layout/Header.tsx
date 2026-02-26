"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
    FileText, Moon, Sun, Monitor, LogOut, 
    LayoutGrid, ChevronDown, Plus, Library, 
    PencilLine, X 
} from "lucide-react";
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
import { NewWorkspaceModal } from "./NewWorkspaceModal";

export function Header() {
  const { setTheme } = useTheme();
  const { 
    documents, activeDocumentId, setActiveDocument,
    workspaces, activeWorkspaceId, setActiveWorkspace,
    isLibraryOpen, toggleLibrary, updateWorkspaceName, addWorkspace
  } = useAppState();

  const activeDoc = documents.find(d => d.id === activeDocumentId);
  const activeWS = workspaces.find(w => w.id === activeWorkspaceId);

  const [isEditingWS, setIsEditingWS] = useState(false);
  const [wsName, setWsName] = useState(activeWS?.name || "");
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    setWsName(activeWS?.name || "");
  }, [activeWS]);

  const handleRename = () => {
    if (activeWorkspaceId && wsName.trim()) {
      updateWorkspaceName(activeWorkspaceId, wsName);
    }
    setIsEditingWS(false);
  };

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
        
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleLibrary}
            className={cn("rounded-xl h-9 w-9 transition-all", isLibraryOpen ? "bg-primary/10 text-primary shadow-inner" : "text-muted-foreground")}
        >
            <Library className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />

        {/* Workspace Selector */}
        <div className="flex items-center gap-1 group/ws relative">
            {isEditingWS ? (
                <input 
                    autoFocus
                    className="bg-secondary/80 border-primary/20 outline-none px-3 py-1.5 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest w-48 text-center ring-2 ring-primary/10"
                    value={wsName}
                    onChange={(e) => setWsName(e.target.value)}
                    onBlur={handleRename}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                />
            ) : (
                <div className="flex items-center">
                    <button
                        onDoubleClick={() => setIsEditingWS(true)}
                        className="h-9 gap-2 px-3 rounded-l-xl hover:bg-secondary font-black text-[10px] uppercase tracking-[0.15em] text-muted-foreground/80 flex items-center transition-all"
                    >
                        <LayoutGrid className="h-3.5 w-3.5 text-primary/60" />
                        {activeWS?.name || "Workspace"}
                        <PencilLine 
                            onClick={(e) => { e.stopPropagation(); setIsEditingWS(true); }}
                            className="h-3 w-3 ml-2 text-primary opacity-0 group-hover/ws:opacity-100 transition-all cursor-pointer" 
                        />
                    </button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                            variant="ghost" 
                            className="h-9 w-8 px-0 rounded-r-xl border-l border-border/10 hover:bg-secondary text-muted-foreground/40"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="rounded-xl p-2 border-primary/20 shadow-2xl backdrop-blur-3xl w-64 mt-2">
                        <div className="px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">Active Research Nodes</div>
                        {workspaces.map(ws => (
                          <DropdownMenuItem key={ws.id} onClick={() => setActiveWorkspace(ws.id)} className="rounded-lg gap-3 font-bold text-[11px] p-3 hover:bg-primary/10">
                            <div className={cn("w-1.5 h-1.5 rounded-full transition-all", ws.id === activeWorkspaceId ? "bg-primary scale-125 shadow-[0_0_10px_rgba(13,148,136,0.5)]" : "bg-muted-foreground/20")} />
                            {ws.name}
                          </DropdownMenuItem>
                        ))}
                        <div className="border-t border-primary/10 my-1" />
                        <DropdownMenuItem 
                            className="rounded-lg gap-3 font-black text-[10px] uppercase tracking-widest p-3 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                            onClick={() => setShowNewModal(true)}
                        >
                          <Plus className="h-3.5 w-3.5" /> NEW WORKSPACE
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
        <NewWorkspaceModal isOpen={showNewModal} onClose={() => setShowNewModal(false)} />
      </div>

      {/* Document Selector (Horizontal Tabs) */}
      <div className="flex-1" />

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
                onClick={() => setActiveWorkspace(null)}
                className="text-muted-foreground hover:text-primary transition-colors hidden sm:flex items-center gap-2 font-black uppercase tracking-[0.15em] text-[10px] group"
            >
                <LayoutGrid className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                Dashboard
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


