"use client";

import { useAppState } from "@/store/useAppState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayoutGrid, X, ArrowRight } from "lucide-react";
import { useState } from "react";

interface NewWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NewWorkspaceModal({ isOpen, onClose }: NewWorkspaceModalProps) {
  const { addWorkspace, setActiveWorkspace } = useAppState();
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (name.trim()) {
      const id = 'ws_' + Math.random().toString(36).substr(2, 9);
      addWorkspace({ id, name, documentIds: [] });
      setName("");
      onClose();
      setActiveWorkspace(id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/60 backdrop-blur-md animate-in fade-in duration-300">
        <div 
            className="w-full max-w-xl bg-card border border-border/50 rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-10 text-center relative">
                <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 p-2 rounded-full hover:bg-secondary text-muted-foreground/40 hover:text-foreground transition-all"
                >
                    <X className="h-5 w-5" />
                </button>
                
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <LayoutGrid className="h-8 w-8" />
                </div>
                
                <h3 className="text-3xl font-serif italic font-bold mb-3">Initialize Workspace</h3>
                <p className="text-muted-foreground text-sm font-medium mb-10 max-w-xs mx-auto">Define the scope and title for your new generative research environment.</p>
                
                <div className="space-y-6">
                    <div className="text-left space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary px-2">Environment Label</label>
                        <Input 
                            autoFocus
                            placeholder="e.g., Quantum Physics Thesis"
                            className="h-16 px-6 bg-secondary/30 border-transparent focus:border-primary/50 text-base font-bold rounded-[24px]"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                    </div>
                    
                    <Button 
                        className="w-full h-16 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] gap-3 shadow-2xl shadow-primary/30"
                        onClick={handleCreate}
                    >
                        Build Workspace
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}
