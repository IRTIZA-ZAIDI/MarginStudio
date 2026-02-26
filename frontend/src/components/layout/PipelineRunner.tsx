"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
    Play, HardDrive, FileUp, Zap, 
    CheckCircle2, Clock, ChevronRight, 
    MoreVertical, Search, Filter, 
    ArrowUpRight, AlertCircle, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function PipelineRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const pipelines = [
    { id: 'p1', name: 'Legal Digest v2', status: 'Ready', lastRun: '2 days ago', nodes: 8 },
    { id: 'p2', name: 'Medical Synthesis', status: 'Active', lastRun: '6 hours ago', nodes: 12 },
    { id: 'p3', name: 'Standard Summarizer', status: 'Ready', lastRun: 'Just now', nodes: 4 },
  ];

  const results = [
    { id: 'r1', name: 'Case_Study_Export_FR.pdf', type: 'Synthesis', date: '2024-02-26', size: '1.2MB' },
    { id: 'r2', name: 'Clinical_Trial_Summary.json', type: 'Extraction', date: '2024-02-25', size: '450KB' },
  ];

  const handleRun = () => {
    setIsRunning(true);
    let p = 0;
    const interval = setInterval(() => {
        p += 2;
        setProgress(p);
        if (p >= 100) {
            clearInterval(interval);
            setIsRunning(false);
            setProgress(0);
        }
    }, 50);
  };

  return (
    <div className="h-full flex flex-col bg-background p-10 overflow-hidden">
        <div className="flex items-center justify-between mb-12">
            <div>
                <h2 className="text-4xl font-serif italic font-bold tracking-tight mb-2">Automated Execution</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Production Deployment Engine</p>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="outline" className="h-14 px-8 rounded-[24px] border-primary/20 bg-secondary/30 font-bold text-xs gap-3">
                    <Filter className="h-4 w-4" /> Filter Jobs
                </Button>
            </div>
        </div>

        <div className="flex-1 flex gap-10 overflow-hidden">
            {/* Pipeline Selector & Input */}
            <div className="w-1/2 flex flex-col gap-8">
                <div className="bg-card/40 border border-border/40 rounded-[44px] p-10 flex flex-col gap-10 backdrop-blur-3xl shadow-2xl shadow-primary/5">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">Execution Config</div>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="px-2 text-[10px] font-black uppercase tracking-widest opacity-40">Choose Blueprint</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {pipelines.map(p => (
                                        <button key={p.id} className="flex items-center justify-between p-5 rounded-[24px] bg-secondary/50 border border-transparent hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-900 transition-all text-left group">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                    <Zap className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold tracking-tight">{p.name}</div>
                                                    <div className="text-[10px] opacity-40 font-bold">{p.nodes} specialized nodes</div>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="px-2 text-[10px] font-black uppercase tracking-widest opacity-40">Drop Input Source</label>
                                <div className="h-44 border-2 border-dashed border-primary/20 rounded-[32px] bg-primary/5 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-primary/10 transition-all">
                                    <div className="h-16 w-16 rounded-[24px] bg-white dark:bg-zinc-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <FileUp className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-1">Upload Folder or ZIP</div>
                                        <div className="text-xs font-bold opacity-40">Up to 500MB per batch</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button 
                        onClick={handleRun}
                        disabled={isRunning}
                        className="h-20 rounded-[32px] bg-primary text-primary-foreground font-black text-sm uppercase tracking-[0.3em] gap-4 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden relative"
                    >
                        {isRunning ? (
                            <>
                                <Loader2 className="h-6 w-6 animate-spin" />
                                Processing Batch... {progress}%
                                <div className="absolute bottom-0 left-0 h-1.5 bg-white/20 transition-all duration-300" style={{ width: `${progress}%` }} />
                            </>
                        ) : (
                            <>
                                <Play className="h-6 w-6 fill-current" />
                                Initiate Pipeline
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Results & History */}
            <div className="flex-1 flex flex-col gap-8 overflow-hidden">
                <div className="bg-card/40 border border-border/40 rounded-[44px] p-10 flex-1 flex flex-col overflow-hidden backdrop-blur-3xl shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Intelligence Output</div>
                        <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest gap-2 opacity-50">
                            Clear History
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {results.map(r => (
                            <div key={r.id} className="group flex items-center justify-between p-6 rounded-[30px] bg-secondary/30 border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="text-base font-bold tracking-tight mb-1">{r.name}</div>
                                        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest opacity-40">
                                            <span className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary" /> {r.type}</span>
                                            <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {r.date}</span>
                                            <span>{r.size}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="h-5 w-5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-32 bg-primary/10 border border-primary/20 rounded-[32px] p-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-sm font-bold tracking-tight">Enterprise Scaling</div>
                            <div className="text-[10px] opacity-60 font-medium leading-relaxed max-w-xs">Your pipelines are deployed on high-performance v4.5 nodes.</div>
                        </div>
                    </div>
                    <Button variant="outline" className="rounded-xl border-primary/30 font-bold text-[10px] uppercase tracking-widest px-6 h-10">
                        View Analytics
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}
