"use client";

import { useAppState, GeneratedAsset } from "@/store/useAppState";
import { cn } from "@/lib/utils";
import { 
    BrainCircuit, FileText, ListTodo, Presentation, 
    Mic, GitBranch, X, Sparkles, Clock, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MarkdownRenderer } from "@/components/ai-sidebar/MarkdownRenderer";

export function AssetDisplay() {
  const { assets, isGenerating, activeTab } = useAppState();

  // Find the asset matching the active tab
  const selectedAsset = assets.find(a => a.type === activeTab);
  
  const getIcon = (type: GeneratedAsset['type']) => {
    switch(type) {
        case 'flashcards': return <BrainCircuit className="h-4 w-4" />;
        case 'summary': return <FileText className="h-4 w-4" />;
        case 'pointers': return <ListTodo className="h-4 w-4" />;
        case 'slidedeck': return <Presentation className="h-4 w-4" />;
        case 'podcast': return <Mic className="h-4 w-4" />;
        case 'diagram': return <GitBranch className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative z-10">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
            {selectedAsset ? (
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="border-b border-border pb-8">
                        <div className="flex items-center gap-4 text-primary mb-4">
                            <div className="p-3 bg-primary/10 rounded-2xl shadow-inner">
                                {getIcon(selectedAsset.type)}
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">Generated {selectedAsset.type}</span>
                                <h2 className="text-4xl font-serif italic font-bold tracking-tight">{selectedAsset.title}</h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="text-xs text-muted-foreground flex items-center gap-2 font-bold uppercase tracking-wider bg-secondary/50 px-3 py-1.5 rounded-full">
                                <Clock className="h-3.5 w-3.5" />
                                {new Date(selectedAsset.timestamp).toLocaleTimeString()}
                            </p>
                            <div className="h-1 flex-1 bg-gradient-to-r from-primary/20 to-transparent rounded-full" />
                        </div>
                    </div>
                    
                    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-headings:italic prose-p:leading-relaxed prose-li:marker:text-primary">
                        <MarkdownRenderer content={selectedAsset.content} />
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                        <div className="relative rounded-3xl bg-secondary/50 p-10 border border-border shadow-2xl animate-pulse">
                            {isGenerating ? (
                                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            ) : (
                                <Sparkles className="h-12 w-12 text-primary/40" />
                            )}
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-serif italic font-bold text-foreground">
                            {isGenerating ? "Weaving intelligence..." : "Magic Awaits"}
                        </h3>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-40 max-w-[200px] mx-auto">
                            {isGenerating ? "Your workspace is being enhanced with AI insights" : "Select a magic tab above to generate insights"}
                        </p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}

