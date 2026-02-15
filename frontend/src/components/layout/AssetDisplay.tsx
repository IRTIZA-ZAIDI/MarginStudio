"use client";

import { useAppState, GeneratedAsset } from "@/store/useAppState";
import { cn } from "@/lib/utils";
import { 
    BrainCircuit, FileText, ListTodo, Presentation, 
    Mic, GitBranch, X, Sparkles, Clock, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MarkdownRenderer } from "@/components/ai-sidebar/MarkdownRenderer";

export function AssetDisplay() {
  const { assets, isGenerating } = useAppState();
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const selectedAsset = assets.find(a => a.id === selectedAssetId) || (assets.length > 0 ? assets[0] : null);

  if (assets.length === 0 && !isGenerating) return null;

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
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-md border-r border-border animate-in slide-in-from-left duration-300">
        <div className="flex h-14 items-center justify-between px-6 border-b shrink-0">
            <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-serif italic font-bold tracking-tight">Studio Assets</span>
            </div>
            {isGenerating && (
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
                    Generating...
                </div>
            )}
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* List */}
            <div className="w-64 border-r border-border overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {assets.map((asset) => (
                    <button
                        key={asset.id}
                        onClick={() => setSelectedAssetId(asset.id)}
                        className={cn(
                            "w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left group",
                            (selectedAssetId === asset.id || (!selectedAssetId && assets[0]?.id === asset.id))
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className={cn(
                            "mt-0.5 rounded-lg p-1.5",
                            (selectedAssetId === asset.id || (!selectedAssetId && assets[0]?.id === asset.id)) ? "bg-white/20" : "bg-primary/5 text-primary"
                        )}>
                            {getIcon(asset.type)}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-black uppercase tracking-wider line-clamp-1">{asset.type}</span>
                            <span className="text-[10px] opacity-70 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(asset.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                ))}
            </div>

            {/* Viewer */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-card/30">
                {selectedAsset ? (
                    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="border-b border-border pb-6">
                            <div className="flex items-center gap-3 text-primary mb-2">
                                {getIcon(selectedAsset.type)}
                                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{selectedAsset.type}</span>
                            </div>
                            <h2 className="text-3xl font-serif italic font-bold tracking-tight">{selectedAsset.title}</h2>
                        </div>
                        
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-serif prose-headings:italic">
                            <MarkdownRenderer content={selectedAsset.content} />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
                        <div className="rounded-full bg-secondary p-4">
                            <Sparkles className="h-8 w-8 opacity-20" />
                        </div>
                        <p className="text-sm font-medium">Select an asset to view details</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
