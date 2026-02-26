"use client";

import { useAppState } from "@/store/useAppState";
import { Button } from "@/components/ui/button";
import { 
    Plus, Play, Settings, Database, 
    ChevronRight, Zap, Sparkles, Languages, 
    FileSearch, MoreHorizontal, Network, Quote, GitBranch
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Node {
    id: string;
    type: 'input' | 'process' | 'ai' | 'output' | 'logic';
    label: string;
    icon: React.ReactNode;
    description?: string;
    x: number;
    y: number;
    status: 'idle' | 'running' | 'success' | 'working';
}

export function WorkflowCanvas() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', type: 'input', label: 'Research Materials', description: 'Folder/Zip Input', icon: <Database className="h-4 w-4" />, x: 80, y: 150, status: 'success' },
    { id: '2', type: 'ai', label: 'Summarize', description: 'Deep context extract', icon: <Sparkles className="h-4 w-4" />, x: 320, y: 100, status: 'idle' },
    { id: '5', type: 'ai', label: 'Translate', description: 'Multi-lang synthesis', icon: <Languages className="h-4 w-4" />, x: 320, y: 220, status: 'working' },
    { id: '3', type: 'logic', label: 'Entity Filter', description: 'Legal/Medical focus', icon: <FileSearch className="h-4 w-4" />, x: 560, y: 160, status: 'idle' },
    { id: '4', type: 'output', label: 'Vault Export', description: 'Verified Citations', icon: <Zap className="h-4 w-4" />, x: 800, y: 160, status: 'idle' },
  ]);

  return (
    <div className="h-full w-full bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden flex flex-col">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none bg-[radial-gradient(#e5e7eb_2px,transparent_2px)] [background-size:40px_40px]" />
      
      {/* Canvas Header */}
      <div className="flex items-center justify-between p-8 z-10 bg-background/50 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                <Network className="h-7 w-7" />
            </div>
            <div>
                <h2 className="text-3xl font-serif italic font-bold tracking-tight">AI Pipeline Studio</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Architecting Automated Knowledge Extraction</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="outline" className="h-12 rounded-2xl border-primary/20 gap-3 font-bold text-xs px-8">
                <Settings className="h-4 w-4" /> Blueprint Config
            </Button>
            <Button className="h-12 rounded-2xl gap-3 font-bold text-xs px-8 shadow-2xl shadow-primary/30">
                <Play className="h-3.5 w-3.5" /> Deploy Model
            </Button>
        </div>
      </div>

      <div className="flex-1 relative cursor-crosshair overflow-auto p-20">
        {/* Nodes */}
        {nodes.map((node) => (
            <div 
                key={node.id}
                style={{ left: node.x, top: node.y }}
                className={cn(
                    "absolute w-64 p-6 rounded-[32px] bg-card border shadow-2xl transition-all hover:scale-105 group cursor-grab active:cursor-grabbing",
                    node.status === 'success' ? "border-primary/40 shadow-primary/5" : "border-border/50",
                    node.status === 'working' && "border-primary border-dashed animate-pulse"
                )}
            >
                <div className="flex items-center justify-between mb-5">
                    <div className={cn(
                        "p-3 rounded-2xl",
                        node.type === 'ai' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-secondary text-primary"
                    )}>
                        {node.icon}
                    </div>
                    <div className="flex items-center gap-1.5 bg-secondary/30 px-2.5 py-1 rounded-full">
                        <div className={cn(
                            "h-1.5 w-1.5 rounded-full ring-2 ring-primary/20", 
                            node.status === 'success' ? "bg-primary" : "bg-muted-foreground/30",
                            node.status === 'working' && "bg-primary animate-ping"
                        )} />
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{node.status}</span>
                    </div>
                </div>
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-1">{node.type} module</div>
                    <div className="text-lg font-bold tracking-tight mb-1">{node.label}</div>
                    <div className="text-[10px] font-medium text-muted-foreground leading-relaxed italic">{node.description}</div>
                </div>

                {/* Connection Points */}
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary/40 group-hover:scale-125 transition-transform shadow-sm" />
                <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary/40 group-hover:scale-125 transition-transform shadow-sm" />
            </div>
        ))}

        {/* connections logic (mock) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible opacity-20">
            <path d="M 344 180 C 344 180, 550 160, 560 160" stroke="currentColor" strokeWidth="2" fill="none" className="text-primary" />
        </svg>

        {/* Specialized Toolbox */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 p-3 bg-background/90 backdrop-blur-3xl border border-primary/30 rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] z-50 animate-in slide-in-from-bottom-10">
            <div className="flex items-center gap-1.5 px-2">
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all">
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
            <div className="w-px h-10 bg-primary/10 mx-2" />
            
            <div className="flex items-center gap-2 pr-4">
                {[
                    { icon: <Database className="h-4 w-4" />, label: 'Data Source', type: 'input' },
                    { icon: <Sparkles className="h-4 w-4" />, label: 'Summarizer', type: 'ai' },
                    { icon: <Languages className="h-4 w-4" />, label: 'Translator', type: 'ai' },
                    { icon: <FileSearch className="h-4 w-4" />, label: 'Extractor', type: 'ai' },
                    { icon: <Quote className="h-4 w-4" />, label: 'Citations', type: 'ai' },
                    { icon: <GitBranch className="h-4 w-4" />, label: 'Logic Flow', type: 'logic' },
                ].map((tool, i) => (
                    <Button key={i} variant="ghost" className="h-14 px-5 rounded-[22px] gap-4 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all group">
                        <div className="transition-transform group-hover:scale-110">{tool.icon}</div>
                        {tool.label}
                    </Button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
