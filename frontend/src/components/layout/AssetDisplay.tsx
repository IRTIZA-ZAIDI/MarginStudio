"use client";

import { useAppState, GeneratedAsset } from "@/store/useAppState";
import { cn } from "@/lib/utils";
import { 
    BrainCircuit, FileText, ListTodo, Presentation, 
    Mic, GitBranch, X, Sparkles, Clock, Loader2, MessageSquare,
    HelpCircle, ListChecks
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MarkdownRenderer } from "@/components/ai-sidebar/MarkdownRenderer";

const MAGIC_TOOLS: { id: GeneratedAsset['type']; icon: React.ReactNode; label: string; prompt: string; color: string }[] = [
    { id: "flashcards", icon: <BrainCircuit className="h-4 w-4" />, label: "Make Flashcards", prompt: "Convert this into active recall flashcards.", color: "bg-purple-500/10 text-purple-500" },
    { id: "summary", icon: <FileText className="h-4 w-4" />, label: "Full Summary", prompt: "Provide a comprehensive summary of this content.", color: "bg-teal-500/10 text-teal-500" },
    { id: "pointers", icon: <ListTodo className="h-4 w-4" />, label: "Key Pointers", prompt: "Extract the most important bullet points.", color: "bg-amber-500/10 text-amber-500" },
    { id: "mcqs", icon: <ListChecks className="h-4 w-4" />, label: "Generate MCQs", prompt: "Create 5 multiple choice questions with answers.", color: "bg-cyan-500/10 text-cyan-500" },
    { id: "questions", icon: <HelpCircle className="h-4 w-4" />, label: "Study Questions", prompt: "Generate deep-dive study questions.", color: "bg-orange-500/10 text-orange-500" },
    { id: "slidedeck", icon: <Presentation className="h-4 w-4" />, label: "Slide Deck Outline", prompt: "Create a 5-slide presentation outline based on this.", color: "bg-rose-500/10 text-rose-500" },
    { id: "podcast", icon: <Mic className="h-4 w-4" />, label: "Podcast Script", prompt: "Turn this selection into a compelling podcast script for two hosts.", color: "bg-indigo-500/10 text-indigo-500" },
    { id: "diagram", icon: <GitBranch className="h-4 w-4" />, label: "Diagram / Flow", prompt: "Describe how to represent this as a Mermaid diagram or flowchart.", color: "bg-emerald-500/10 text-emerald-500" },
];

export function AssetDisplay() {
  const { 
    assets, isGenerating, currentSelection, sendMessage, setSidebarOpen,
    documents, activeDocumentId 
  } = useAppState();
  
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [pendingTool, setPendingTool] = useState<typeof MAGIC_TOOLS[0] | null>(null);
  const [options, setOptions] = useState<{ tone: any; creativity: number; targetDocId: string }>({
    tone: 'professional',
    creativity: 0.5,
    targetDocId: activeDocumentId || documents[0]?.id || ''
  });

  const selectedAsset = assets.find(a => a.id === selectedAssetId) || (assets.length > 0 ? assets[0] : null);
  
  const handleStartGeneration = () => {
    if (!pendingTool) return;
    
    sendMessage(pendingTool.prompt, currentSelection, pendingTool.id as any, {
        tone: options.tone,
        creativity: options.creativity,
        targetDocumentId: options.targetDocId
    });
    
    setPendingTool(null);
  };

  const getIcon = (type: GeneratedAsset['type']) => {
    const tool = MAGIC_TOOLS.find(t => t.id === type);
    return tool?.icon || <Sparkles className="h-4 w-4" />;
  };

  return (
    <div className="flex h-full bg-background animate-in fade-in duration-500 relative">
        {/* Options Modal Overlay */}
        {pendingTool && (
            <div className="absolute inset-0 z-[100] bg-background/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in scale-in-95 duration-300">
                <div className="w-full max-w-lg bg-background border border-border shadow-2xl rounded-[32px] overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-border/50 bg-secondary/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={cn("p-4 rounded-2xl shadow-lg", pendingTool.color)}>
                                {pendingTool.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-serif italic font-bold text-foreground">{pendingTool.label}</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Configure Magic Generation</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Tone Selector */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Tone & Style</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['professional', 'creative', 'concise', 'academic'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setOptions(prev => ({ ...prev, tone: t as any }))}
                                            className={cn(
                                                "px-4 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                                                options.tone === t ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-secondary/50 border-transparent hover:bg-secondary text-muted-foreground"
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Creativity Slider */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Creativity Level</label>
                                    <span className="text-[10px] font-bold font-mono">{Math.round(options.creativity * 100)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" max="1" step="0.1" 
                                    value={options.creativity}
                                    onChange={(e) => setOptions(prev => ({ ...prev, creativity: parseFloat(e.target.value) }))}
                                    className="w-full accent-primary h-1.5 bg-secondary rounded-full appearance-none cursor-pointer"
                                />
                            </div>

                            {/* Document Picker */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Source Document</label>
                                <select 
                                    value={options.targetDocId}
                                    onChange={(e) => setOptions(prev => ({ ...prev, targetDocId: e.target.value }))}
                                    className="w-full bg-secondary/50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none ring-1 ring-border/50 focus:ring-primary/40 transition-all appearance-none"
                                >
                                    <option value="all_workspace">Entire Workspace ({documents.length} Docs)</option>
                                    {documents.map(doc => (
                                        <option key={doc.id} value={doc.id}>{doc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-secondary/5 flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            className="flex-1 rounded-xl h-12 font-black text-[10px] uppercase tracking-[0.2em]"
                            onClick={() => setPendingTool(null)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="flex-2 rounded-xl h-12 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
                            onClick={handleStartGeneration}
                        >
                            Generate Magic
                        </Button>
                    </div>
                </div>
            </div>
        )}

        {/* Magic Tools Sidebar */}
        <div className="w-80 border-r border-border/50 bg-secondary/10 flex flex-col shrink-0">
            <div className="p-6 border-b border-border/50">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Magic Tools</h3>
                <div className="grid grid-cols-1 gap-2">
                    {MAGIC_TOOLS.map((tool) => {
                        const isDisabled = isGenerating;
                        return (
                            <button
                                key={tool.id}
                                disabled={isDisabled}
                                onClick={() => {
                                    setPendingTool(tool);
                                    setOptions(prev => ({ ...prev, targetDocId: activeDocumentId || documents[0]?.id || '' }));
                                }}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl transition-all text-left group relative overflow-hidden border border-transparent",
                                    isDisabled ? "opacity-30 grayscale cursor-not-allowed" : "hover:bg-background hover:border-border hover:shadow-sm active:scale-[0.98]"
                                )}
                            >
                                <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", tool.color)}>
                                    {isGenerating && pendingTool?.id === tool.id ? <Loader2 className="h-4 w-4 animate-spin" /> : tool.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold leading-tight">{tool.label}</span>
                                    <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider opacity-60">
                                        {currentSelection ? 'Selection Ready' : 'Whole Document'}
                                    </span>
                                </div>
                                {!currentSelection && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Sparkles className="h-3 w-3 text-primary/40" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>


            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Generated Assets</h3>
                    {assets.length > 0 && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-black">{assets.length}</span>}
                </div>
                
                {assets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                        <Clock className="h-8 w-8 mb-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">No history yet</span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {assets.map((asset) => (
                            <button
                                key={asset.id}
                                onClick={() => setSelectedAssetId(asset.id)}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl transition-all border group relative",
                                    selectedAsset?.id === asset.id 
                                        ? "bg-background border-primary shadow-lg shadow-primary/5" 
                                        : "bg-transparent border-transparent hover:bg-background/50"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "p-2 rounded-lg shrink-0",
                                        MAGIC_TOOLS.find(t => t.id === asset.type)?.color || "bg-secondary text-foreground"
                                    )}>
                                        {getIcon(asset.type)}
                                    </div>
                                    <div className="flex flex-col gap-0.5 overflow-hidden">
                                        <span className="text-xs font-bold truncate pr-4">{asset.title}</span>
                                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">
                                            {new Date(asset.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:32px_32px]">
            {selectedAsset ? (
                <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-primary">
                            <div className={cn(
                                "p-4 rounded-2xl shadow-xl transition-transform hover:rotate-3",
                                MAGIC_TOOLS.find(t => t.id === selectedAsset.type)?.color || "bg-primary/10 text-primary"
                            )}>
                                {getIcon(selectedAsset.type)}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.2em]">
                                        {selectedAsset.type}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">
                                        {new Date(selectedAsset.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <h2 className="text-4xl font-serif italic font-bold tracking-tight text-foreground leading-[1.1]">{selectedAsset.title}</h2>
                            </div>
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-border via-border to-transparent" />
                    </div>
                    
                    <div className="prose prose-teal prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-headings:italic prose-p:text-muted-foreground/90 prose-p:leading-relaxed prose-li:text-muted-foreground/90 pb-20">
                        <MarkdownRenderer content={selectedAsset.content} />
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
                        <div className="relative rounded-[40px] bg-background/50 backdrop-blur-xl p-16 border border-border shadow-2xl flex items-center justify-center">
                            {isGenerating ? (
                                <div className="relative">
                                  <Loader2 className="h-16 w-16 text-primary animate-spin" />
                                  <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary/40 animate-pulse" />
                                </div>
                            ) : (
                                <Sparkles className="h-16 w-16 text-primary/20" />
                            )}
                        </div>
                    </div>
                    <div className="text-center space-y-3 max-w-xs transition-all duration-500">
                        <h3 className="text-2xl font-serif italic font-bold text-foreground">
                            {isGenerating ? "Synthesizing Knowledge" : "Your Magic Canvas"}
                        </h3>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 leading-relaxed">
                            {isGenerating 
                                ? "Our models are extracting patterns and weaving insights for you." 
                                : "Select a text block in the document and choose a magic tool from the left to begin your research."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}


