"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
    Play, HardDrive, FileUp, Zap, 
    CheckCircle2, Clock, ChevronRight, 
    MoreVertical, Search, Filter, 
    ArrowUpRight, AlertCircle, Loader2,
    Calendar, Box, BarChart3, Activity,
    Download, Trash2, StopCircle, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function PipelineRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeJob, setActiveJob] = useState<string | null>(null);

  const pipelines = [
    { id: 'p1', name: 'Legal Digest v2', status: 'Ready', lastRun: '2 days ago', nodes: 8, color: '#8b5cf6' },
    { id: 'p2', name: 'Medical Synthesis', status: 'Active', lastRun: '6 hours ago', nodes: 12, color: '#0d9488' },
    { id: 'p3', name: 'Standard Summarizer', status: 'Ready', lastRun: 'Just now', nodes: 4, color: '#ec4899' },
  ];

  const jobs = [
    { id: 'j1', name: 'Batch_Feb_26.zip', pipeline: 'Legal Digest v2', status: 'completed', time: '14:20', duration: '12s', color: '#8b5cf6' },
    { id: 'j2', name: 'Folder_Clinical_Trials', pipeline: 'Medical Synthesis', status: 'running', time: '11:05', duration: '45s', color: '#0d9488' },
    { id: 'j3', name: 'Research_Notes_Archive', pipeline: 'Standard Summarizer', status: 'failed', time: 'Yesterday', duration: '2s', color: '#ec4899' },
  ];

  const handleRun = () => {
    setIsRunning(true);
    let p = 0;
    const interval = setInterval(() => {
        p += 1;
        setProgress(p);
        if (p >= 100) {
            clearInterval(interval);
            setIsRunning(false);
            setProgress(0);
        }
    }, 30);
  };

  return (
    <div className="h-full flex flex-col bg-[#fafbfc] dark:bg-[#020617] p-8 overflow-hidden font-sans">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                    <Activity className="h-7 w-7" />
                </div>
                <div>
                    <h2 className="text-3xl font-serif italic font-bold tracking-tight">Execution Engine</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Production Pipeline Orchestrator</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-4 py-2 bg-secondary/30 rounded-xl mr-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold opacity-60">System Online</span>
                </div>
                <Button variant="outline" className="h-11 px-6 rounded-xl border-border/50 bg-background font-bold text-xs gap-2">
                    <BarChart3 className="h-4 w-4 opacity-40" /> Metrics
                </Button>
                <Button className="h-11 rounded-xl bg-primary text-primary-foreground font-bold text-xs px-6 shadow-xl shadow-primary/20 gap-2">
                    <Zap className="h-4 w-4" /> Global Config
                </Button>
            </div>
        </div>

        <div className="flex-1 flex gap-8 overflow-hidden">
            {/* Left Column: Blueprint & Deployment */}
            <div className="w-96 flex flex-col gap-6">
                <div className="bg-white dark:bg-zinc-900 border border-border/40 rounded-3xl p-6 flex flex-col gap-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Deploy Model</span>
                        <Settings className="h-3.5 w-3.5 opacity-20" />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-2.5">
                            <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-1">Research Blueprint</label>
                            <div className="space-y-2">
                                {pipelines.map(p => (
                                    <button 
                                        key={p.id} 
                                        className={cn(
                                            "w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-transparent hover:border-primary/20 transition-all text-left group",
                                            activeJob === p.id && "bg-primary/10 border-primary/20 ring-1 ring-primary/10"
                                        )}
                                        onClick={() => setActiveJob(p.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${p.color}15`, color: p.color }}>
                                                <Zap className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold truncate">{p.name}</div>
                                                <div className="text-[9px] opacity-40 font-medium">{p.nodes} Nodes</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-3 w-3 opacity-20 group-hover:opacity-100 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-1">Input Source</label>
                            <div className="h-32 border-2 border-dashed border-border/40 rounded-2xl bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-3 group cursor-pointer hover:bg-primary/5 transition-all">
                                <FileUp className="h-6 w-6 text-muted-foreground/40 group-hover:text-primary group-hover:scale-110 transition-all" />
                                <div className="text-[9px] font-black uppercase tracking-widest opacity-40">Drop ZIP / Folder</div>
                            </div>
                        </div>
                    </div>

                    <Button 
                        onClick={handleRun}
                        disabled={isRunning}
                        className="h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest gap-3 shadow-xl shadow-primary/20 group relative overflow-hidden mt-2"
                    >
                        {isRunning ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="relative z-10">Running {progress}%</span>
                                <div className="absolute inset-0 bg-primary-foreground/10 origin-left transition-transform duration-300" style={{ transform: `scaleX(${progress/100})` }} />
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4 fill-current transition-transform group-hover:scale-110" />
                                Start Run
                            </>
                        )}
                    </Button>
                </div>

                <div className="bg-primary/95 text-primary-foreground rounded-3xl p-6 shadow-xl shadow-primary/20 relative overflow-hidden group border border-white/20">
                    <div className="absolute -right-6 -bottom-6 opacity-10 transition-transform group-hover:scale-110 duration-700">
                        <Box className="h-32 w-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                            <Star className="h-5 w-5" />
                        </div>
                        <h4 className="font-serif italic font-bold text-lg mb-1">Scale with Enterprise</h4>
                        <p className="text-[10px] font-medium opacity-80 leading-relaxed max-w-[200px]">Unlock distributed compute nodes and unlimited concurrent pipelines.</p>
                    </div>
                </div>
            </div>

            {/* Right Column: Jobs Feed & Terminal */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                <div className="flex-1 bg-white dark:bg-zinc-900 border border-border/40 rounded-3xl flex flex-col overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border/40 flex items-center justify-between bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Activity</span>
                            <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-lg">
                                <Button variant="ghost" size="sm" className="h-7 px-3 rounded-md text-[9px] font-black bg-white dark:bg-zinc-800 shadow-sm">All Jobs</Button>
                                <Button variant="ghost" size="sm" className="h-7 px-3 rounded-md text-[9px] font-black opacity-40">Running</Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                <Search className="h-4 w-4 opacity-40" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                <Filter className="h-4 w-4 opacity-40" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/30">
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest opacity-30">Job Source</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest opacity-30">Blueprint</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest opacity-30">Status</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest opacity-30">Runtime</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {jobs.map(job => (
                                    <tr key={job.id} className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-white dark:bg-zinc-950 border border-border/30 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                                                    <Download className="h-4 w-4 opacity-40" />
                                                </div>
                                                <span className="text-xs font-bold tracking-tight">{job.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: job.color }} />
                                                <span className="text-[10px] font-bold opacity-60">{job.pipeline}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                job.status === 'completed' ? "bg-emerald-500/10 text-emerald-600" :
                                                job.status === 'running' ? "bg-primary/10 text-primary animate-pulse" :
                                                "bg-rose-500/10 text-rose-600"
                                            )}>
                                                {job.status === 'running' && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                                                {job.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-[10px] font-black opacity-30 flex items-center gap-2">
                                                <Clock className="h-3 w-3" />
                                                {job.duration}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Console / Log (Bottom) */}
                <div className="h-44 bg-[#0d1117] rounded-3xl p-5 font-mono flex flex-col overflow-hidden border border-white/5">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-full bg-rose-500/20" />
                                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/20" />
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/20" />
                            </div>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">System Log</span>
                        </div>
                        <StopCircle className="h-4 w-4 text-zinc-700 cursor-pointer hover:text-rose-500 transition-colors" />
                    </div>
                    <div className="flex-1 overflow-y-auto text-[11px] space-y-1.5 custom-scrollbar px-2">
                        <div className="text-emerald-500/60">[SYSTEM] Connection established to compute-node-04</div>
                        <div className="text-zinc-500">[12:18:04] Fetching ZIP archive: Batch_Feb_26.zip</div>
                        <div className="text-zinc-500">[12:18:05] Initializing 'Summarizer' node cluster...</div>
                        <div className="text-primary/60 animate-pulse">[12:18:06] Processing document 4/12 (Medical_Journal_Ref_4a.pdf)</div>
                        <div className="text-zinc-600">[12:18:08] Context tokens: 1.2M / Peak memory: 4.2GB</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

function Star(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
