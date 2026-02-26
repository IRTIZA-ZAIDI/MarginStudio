"use client";

import { useAppState } from "@/store/useAppState";
import { Button } from "@/components/ui/button";
import { 
    Plus, Play, Settings, Database, 
    ChevronRight, Zap, Sparkles, Languages, 
    FileSearch, MoreHorizontal, Network, Quote, GitBranch,
    MousePointer2, Hand, ZoomIn, ZoomOut, Maximize,
    LayoutDashboard, Command, Layers, Terminal
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Node {
    id: string;
    type: 'input' | 'process' | 'ai' | 'output' | 'logic';
    label: string;
    icon: React.ReactNode;
    subtitle: string;
    x: number;
    y: number;
    color: string;
    status: 'idle' | 'running' | 'success' | 'working';
}

export function WorkflowCanvas() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', type: 'input', label: 'PDF Library', subtitle: 'Workspace Assets', icon: <Database className="h-4 w-4" />, x: 150, y: 250, color: '#0d9488', status: 'success' },
    { id: '2', type: 'ai', label: 'Summarizer', subtitle: 'Deep Context V4', icon: <Sparkles className="h-4 w-4" />, x: 450, y: 150, color: '#8b5cf6', status: 'idle' },
    { id: '5', type: 'ai', label: 'Translator', subtitle: 'Universal Engine', icon: <Languages className="h-4 w-4" />, x: 450, y: 350, color: '#ec4899', status: 'working' },
    { id: '3', type: 'logic', label: 'Filter', subtitle: 'Entity Extraction', icon: <FileSearch className="h-4 w-4" />, x: 750, y: 250, color: '#f59e0b', status: 'idle' },
    { id: '4', type: 'output', label: 'Knowledge Base', subtitle: 'Vector Index', icon: <Terminal className="h-4 w-4" />, x: 1050, y: 250, color: '#10b981', status: 'idle' },
  ]);

  return (
    <div className="h-full w-full bg-[#f8fafc] dark:bg-[#020617] relative overflow-hidden flex flex-col font-sans">
      {/* n8n Style Grid Background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      
      {/* Top Navigation / Controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50 pointer-events-none">
        <div className="flex items-center gap-3 p-1.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl pointer-events-auto">
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                <LayoutDashboard className="h-5 w-5" />
            </div>
            <div className="pr-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 leading-none mb-1">Architecture</div>
                <div className="text-xs font-bold leading-none">Automated Research Pipeline</div>
            </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-1 p-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg mr-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <Hand className="h-4 w-4 opacity-40" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-primary/10 text-primary">
                    <MousePointer2 className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex items-center gap-1 p-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <ZoomOut className="h-4 w-4 opacity-40" />
                </Button>
                <div className="px-2 text-[10px] font-black opacity-40">100%</div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <ZoomIn className="h-4 w-4 opacity-40" />
                </Button>
            </div>
            <Button className="h-10 rounded-xl gap-2 font-bold text-xs px-6 shadow-xl shadow-primary/30 ml-4 group">
                <Play className="h-3.5 w-3.5 fill-current transition-transform group-hover:scale-110" />
                Execute Flow
            </Button>
        </div>
      </div>

      <div className="flex-1 relative cursor-grab active:cursor-grabbing p-20">
        {/* Connection Lines (Curved n8n Style) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" className="fill-slate-300 dark:fill-slate-700" />
                </marker>
            </defs>
            {/* Example connections based on node positions */}
            <path d="M 334 274 C 380 274, 400 174, 450 174" stroke="currentColor" strokeWidth="2" fill="none" className="text-slate-200 dark:text-slate-800" />
            <path d="M 334 274 C 380 274, 400 374, 450 374" stroke="currentColor" strokeWidth="2" fill="none" className="text-slate-200 dark:text-slate-800" />
            <path d="M 634 174 C 680 174, 700 274, 750 274" stroke="currentColor" strokeWidth="2" fill="none" className="text-slate-200 dark:text-slate-800" />
            <path d="M 634 374 C 680 374, 700 274, 750 274" stroke="currentColor" strokeWidth="2" fill="none" className="text-slate-200 dark:text-slate-800" />
            <path d="M 934 274 C 980 274, 1000 274, 1050 274" stroke="currentColor" strokeWidth="2" fill="none" className="text-slate-200 dark:text-slate-800" />
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
            <div 
                key={node.id}
                style={{ left: node.x, top: node.y }}
                className={cn(
                    "absolute w-48 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] transition-all hover:scale-[1.02] group cursor-grab active:cursor-grabbing flex items-stretch overflow-hidden",
                    node.status === 'working' && "ring-2 ring-primary/40 ring-offset-4 dark:ring-offset-zinc-900 ring-offset-background"
                )}
            >
                {/* n8n Side Color Bar */}
                <div className="w-1.5 shrink-0" style={{ backgroundColor: node.color }} />
                
                <div className="flex-1 p-3.5 pr-5 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 group-hover:border-primary/20 transition-colors">
                        <div style={{ color: node.color }}>{node.icon}</div>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="text-[11px] font-bold tracking-tight truncate">{node.label}</div>
                        <div className="text-[9px] font-medium opacity-40 truncate">{node.subtitle}</div>
                    </div>
                </div>

                {/* Status Indicator (Inside) */}
                {node.status === 'working' && (
                    <div className="absolute top-1.5 right-1.5 h-1 w-1 rounded-full bg-primary animate-ping" />
                )}
                {node.status === 'success' && (
                    <div className="absolute top-1.5 right-1.5 h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                )}

                {/* Port Markers (Input/Output) */}
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-white dark:bg-zinc-950 border-2 border-slate-200 dark:border-slate-800 group-hover:border-primary/50 transition-colors hover:scale-125 cursor-pointer z-10" />
                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-white dark:bg-zinc-950 border-2 border-slate-200 dark:border-slate-800 group-hover:border-primary/50 transition-colors hover:scale-125 cursor-pointer z-10" />
            </div>
        ))}

        {/* Bottom Tool Palette (n8n node library style) */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-border shadow-2xl rounded-2xl z-50 animate-in slide-in-from-bottom-10 border-primary/20">
            <div className="flex items-center gap-1">
                {[
                    { icon: <Database className="h-4 w-4" />, color: '#0d9488', label: 'Inputs' },
                    { icon: <Sparkles className="h-4 w-4" />, color: '#8b5cf6', label: 'AI Actions' },
                    { icon: <Languages className="h-4 w-4" />, color: '#ec4899', label: 'Language' },
                    { icon: <FileSearch className="h-4 w-4" />, color: '#f59e0b', label: 'Analysis' },
                    { icon: <Layers className="h-4 w-4" />, color: '#3b82f6', label: 'Structure' },
                    { icon: <Terminal className="h-4 w-4" />, color: '#10b981', label: 'Exports' },
                ].map((tool, i) => (
                    <button key={i} className="h-10 px-4 rounded-xl flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all group">
                        <div style={{ color: tool.color }} className="transition-transform group-hover:scale-110">{tool.icon}</div>
                        <span className="text-[10px] font-bold opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto overflow-hidden transition-all whitespace-nowrap">{tool.label}</span>
                    </button>
                ))}
            </div>
            <div className="w-px h-6 bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-10 w-10 text-primary">
                <Plus className="h-5 w-5" />
            </Button>
        </div>
      </div>

      {/* Properties Panel (Mock Right Sidebar) */}
      <div className="absolute top-24 right-6 bottom-24 w-72 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl z-40 hidden lg:flex flex-col overflow-hidden animate-in slide-in-from-right-10 border-l-primary/10">
        <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Success Results</span>
            </div>
            <Maximize className="h-3 w-3 opacity-20" />
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div className="space-y-3">
                <div className="text-[9px] font-black uppercase tracking-widest text-primary">Summarizer Statistics</div>
                <div className="p-3 bg-slate-50/50 dark:bg-zinc-800/50 rounded-xl space-y-2">
                    <div className="flex justify-between text-[10px]">
                        <span className="opacity-40">Words Analyzed</span>
                        <span className="font-bold">42,801</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                        <span className="opacity-40">Compression</span>
                        <span className="font-bold text-emerald-500">84%</span>
                    </div>
                </div>
            </div>
            <div className="space-y-3">
                <div className="text-[9px] font-black uppercase tracking-widest text-primary">Translation Mapping</div>
                <div className="flex flex-wrap gap-2 text-[9px] font-bold">
                    <span className="px-2 py-1 bg-secondary rounded-lg">EN → FR</span>
                    <span className="px-2 py-1 bg-secondary rounded-lg">EN → DE</span>
                    <span className="px-2 py-1 bg-secondary rounded-lg">EN → JP</span>
                </div>
            </div>
        </div>
        <div className="p-4 bg-primary/5 border-t border-primary/10">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                    <Command className="h-4 w-4" />
                </div>
                <div className="text-[9px] leading-relaxed opacity-60">Use <kbd className="font-sans font-bold text-[10px] bg-white dark:bg-zinc-800 px-1 rounded shadow-sm border border-border">⌘ + R</kbd> to re-run specific node clusters.</div>
            </div>
        </div>
      </div>
    </div>
  );
}
