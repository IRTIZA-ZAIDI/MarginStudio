"use client";

import { useAppState, Workspace } from "@/store/useAppState";
import { cn } from "@/lib/utils";
import { 
    LayoutGrid, Plus, Folder, Clock, 
    MoreVertical, ArrowRight, Search,
    Cpu, Sparkles, BookOpen, HardDrive,
    Network, Lightbulb, UploadCloud, ChevronRight,
    Settings, HelpCircle, LogOut,
    X, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { NewWorkspaceModal } from "./NewWorkspaceModal";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { PipelineRunner } from "./PipelineRunner";

export function Dashboard() {
  const { workspaces, setActiveWorkspace, addWorkspace, updateWorkspaceName } = useAppState();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState('uploads');

  const filteredWorkspaces = workspaces.filter(ws => 
    ws.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="flex h-screen bg-background overflow-hidden animate-in fade-in duration-700">
      {/* Left Sidebar Menu */}
      <aside className="w-80 border-r border-border/40 bg-card/20 backdrop-blur-3xl flex flex-col p-8 z-40 relative">
        <div className="flex items-center gap-4 mb-14 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-serif italic font-bold shadow-2xl shadow-primary/30">
                M
            </div>
            <div>
                <h1 className="text-xl font-serif italic font-bold tracking-tight">MarginStudio</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Research OS v2.4</p>
            </div>
        </div>

        <nav className="flex-1 space-y-2">
            <div className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Knowledge Hub</div>
            {[
                { id: 'insights', icon: <Lightbulb className="h-4 w-4" />, label: 'Global Insights' },
                { id: 'whiteboard', icon: <Network className="h-4 w-4" />, label: 'AI Whiteboard' },
                { id: 'pipelines', icon: <Zap className="h-4 w-4" />, label: 'Pipelines' },
                { id: 'uploads', icon: <UploadCloud className="h-4 w-4" />, label: 'Master Uploads' },
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className={cn(
                        "w-full flex items-center gap-4 px-5 py-4 rounded-[20px] transition-all relative group overflow-hidden border border-transparent text-sm font-bold",
                        activeMenu === item.id 
                            ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" 
                            : "hover:bg-secondary/60 text-muted-foreground/60 hover:text-foreground"
                    )}
                >
                    <div className={cn("transition-transform duration-500 group-hover:scale-110", activeMenu === item.id ? "text-white" : "text-primary/60")}>
                        {item.icon}
                    </div>
                    {item.label}
                    {activeMenu === item.id && (
                        <div className="absolute right-4 animate-in slide-in-from-left duration-300">
                            <ChevronRight className="h-4 w-4 opacity-50" />
                        </div>
                    )}
                </button>
            ))}
        </nav>

        <div className="pt-8 space-y-4 border-t border-border/30">
            <button className="flex items-center gap-4 px-5 py-3 text-xs font-bold text-muted-foreground/60 hover:text-foreground transition-colors">
                <Settings className="h-4 w-4" /> System Config
            </button>
            <button className="flex items-center gap-4 px-5 py-3 text-xs font-bold text-muted-foreground/60 hover:text-foreground transition-colors">
                <HelpCircle className="h-4 w-4" /> Lab Support
            </button>
            <div className="p-6 rounded-[28px] bg-secondary/30 mt-6 border border-border/30 relative group cursor-pointer hover:bg-secondary/50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <Cpu className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Pro Node Active</span>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground/80 leading-relaxed">Your neural engine is running on Enterprise v4.5.</p>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(13,148,136,0.03),transparent_50%)]">
        {/* Top bar with search and create */}
        <header className="h-28 px-12 flex items-center justify-between z-30">
            <div className="relative group max-w-xl w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                <Input 
                    placeholder="Search your research nodes..." 
                    className="pl-12 h-14 bg-card/40 border-border/30 focus:border-primary/50 focus:ring-0 transition-all text-sm font-bold rounded-[24px] shadow-sm backdrop-blur-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            
            <Button 
                className="h-14 px-8 rounded-[24px] gap-3 font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                onClick={() => setShowNewModal(true)}
            >
                <Plus className="h-5 w-5" />
                Initialize Space
            </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-12 pb-20 custom-scrollbar relative z-20">
            {activeMenu === 'whiteboard' && <WorkflowCanvas />}
            {activeMenu === 'pipelines' && <PipelineRunner />}
            
            {activeMenu !== 'whiteboard' && activeMenu !== 'pipelines' && (
                <>
                    {/* Welcome */}
                    <div className="mb-14 pt-4">
                        <h2 className="text-5xl font-serif italic font-bold mb-4 tracking-tight">Active Research <br /> Environments</h2>
                        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground/50">
                            <span className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" /> {filteredWorkspaces.length} Spaces</span>
                            <div className="w-1 h-1 rounded-full bg-border" />
                            <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> 1.2 GB Analyzed</span>
                        </div>
                    </div>

                    {/* Workspace Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredWorkspaces.map((ws) => (
                        <div 
                            key={ws.id} 
                            onDoubleClick={() => setActiveWorkspace(ws.id)}
                            className="group relative bg-card/30 border border-border/30 rounded-[44px] p-10 transition-all hover:bg-card hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 overflow-hidden backdrop-blur-sm cursor-pointer"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-all duration-700 group-hover:rotate-12">
                                <Folder className="h-48 w-48 -mr-12 -mt-12" />
                            </div>

                            <div className="flex items-start justify-between mb-12 relative z-10">
                                <div className="p-4 bg-primary/10 text-primary rounded-[24px] group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                                    <Folder className="h-7 w-7" />
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-2xl h-10 w-10 text-muted-foreground/40 hover:text-foreground hover:bg-secondary">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="mb-12 relative z-10">
                                <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-primary transition-colors">{ws.name}</h3>
                                <div className="flex flex-wrap items-center gap-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/30"><BookOpen className="h-3 w-3" /> {ws.documentIds.length} Materials</span>
                                    <span className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-primary/60" /> 14 Insights</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 relative z-10">
                                <Button 
                                    onClick={() => setActiveWorkspace(ws.id)}
                                    className="flex-1 rounded-[24px] h-14 font-black text-[11px] uppercase tracking-[0.2em] gap-3 bg-secondary/50 border-transparent text-foreground hover:bg-primary hover:text-primary-foreground group-hover:shadow-2xl transition-all"
                                >
                                    Open Node
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                      ))}

                      {/* Create Card */}
                      <button 
                        onClick={() => setShowNewModal(true)}
                        className="group border border-dashed border-border/50 rounded-[44px] p-10 flex flex-col items-center justify-center gap-6 transition-all hover:border-primary/50 hover:bg-primary/5 min-h-[400px]"
                      >
                        <div className="h-20 w-20 rounded-[32px] bg-secondary/50 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 shadow-inner">
                            <Plus className="h-10 w-10 text-muted-foreground/40 group-hover:text-primary" />
                        </div>
                        <div className="text-center">
                            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mb-2 group-hover:text-primary/70">Initialize Environment</div>
                            <div className="text-lg font-bold">Launch New Space</div>
                        </div>
                      </button>
                    </div>
                </>
            )}
        </div>

        {/* Modal Overlay */}
        <NewWorkspaceModal isOpen={showNewModal} onClose={() => setShowNewModal(false)} />
      </main>

      {/* Decorative Ornaments */}
      <div className="fixed -bottom-40 -right-40 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
    </div>
  );
}
