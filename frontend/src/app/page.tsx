"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { AnnotationToolbar } from "@/components/layout/AnnotationToolbar";
import { SplitView } from "@/components/layout/SplitView";
import { AISidebar } from "@/components/ai-sidebar/AISidebar";
import { LandingPage } from "@/components/layout/LandingPage";
import { Dashboard } from "@/components/layout/Dashboard";
import { AssetDisplay } from "@/components/layout/AssetDisplay";
import { LibrarySidebar } from "@/components/layout/LibrarySidebar";
import { Whiteboard } from "@/components/layout/Whiteboard";
import { NotesEditor } from "@/components/layout/NotesEditor";
import { useAppState } from "@/store/useAppState";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { BookOpen, Sparkles, MessageSquare, Library, Layout, FileText, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";

const PDFRenderer = dynamic(() => import("@/components/pdf-stage/PDFRenderer").then(mod => mod.PDFRenderer), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse text-muted-foreground bg-background">Calibrating Studio...</div>
});

export default function Home() {
  const { 
    documents, activeDocumentId, assets, isSidebarOpen, 
    toggleSidebar, activeTab, setActiveTab,
    isSignedIn, activeWorkspaceId
  } = useAppState();

  const activeDoc = documents.find(d => d.id === activeDocumentId);

  if (!isSignedIn) {
    return <LandingPage />;
  }

  if (!activeWorkspaceId) {
    return <Dashboard />;
  }

  return (
    <div className="flex bg-background font-sans h-screen flex-col overflow-hidden text-foreground uppercase-none">
      <Header />
      <AnnotationToolbar />
      <div className="flex-1 overflow-hidden relative flex">
        <LibrarySidebar />
        <div className="flex-1 h-full overflow-hidden relative">
        <SplitView
          left={
            <div className="h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 border-r relative flex flex-col transition-all">
               
               {/* Top Tabs for View Switching */}
               <div className="flex bg-secondary/30 backdrop-blur-sm p-1.5 rounded-[28px] w-max mx-auto mt-6 mb-4 shadow-sm border border-border/50 shrink-0 z-40 relative group">
                 {[
                   { id: 'reader', icon: <BookOpen className="h-3.5 w-3.5" />, label: 'Document' },
                   { id: 'assets', icon: <Sparkles className="h-3.5 w-3.5" />, label: 'Magic Assets' },
                   { id: 'whiteboard', icon: <Layout className="h-3.5 w-3.5" />, label: 'AI Whiteboard' },
                   { id: 'notes', icon: <PenTool className="h-3.5 w-3.5" />, label: 'Research Notes' },
                 ].map((tab) => (
                   <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)} 
                    className={cn(
                      "px-5 py-2.5 rounded-[22px] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 group/btn relative overflow-hidden", 
                      activeTab === tab.id 
                        ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/30' 
                        : 'text-muted-foreground/40 hover:text-foreground hover:bg-secondary/80'
                    )}
                   >
                     {tab.icon}
                     {tab.label}
                     {tab.id === 'assets' && assets.length > 0 && (
                        <span className={cn("px-1.5 rounded-sm h-4 flex items-center justify-center text-[9px]", activeTab === 'assets' ? 'bg-white/20 text-white' : 'bg-primary/20 text-primary')}>
                            {assets.length}
                        </span>
                     )}
                   </button>
                 ))}
               </div>

               <div className="flex-1 overflow-auto relative custom-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:32px_32px]">
                   {activeTab === 'reader' && (
                       <div className="min-h-screen pb-32 relative">
                          {activeDoc ? (
                            <>
                                <PDFRenderer url={activeDoc.url} />
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                               Select a document to begin analysis
                            </div>
                          )}
                       </div>
                   )}
                   {activeTab === 'assets' && <AssetDisplay />}
                   {activeTab === 'whiteboard' && <Whiteboard />}
                   {activeTab === 'notes' && <NotesEditor />}
               </div>
            </div>
          }


          right={
            <div className="h-full bg-background border-l shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
              <AISidebar />
            </div>
          }
        />

        {/* Floating AI Toggle (When Sidebar is closed) - Positioned on the RIGHT */}
        {!isSidebarOpen && (
          <div className="absolute right-6 bottom-24 z-50 animate-in zoom-in-50 fade-in duration-300">
            <Button
              onClick={toggleSidebar}
              className="h-14 w-14 rounded-full shadow-2xl bg-primary text-primary-foreground hover:scale-110 active:scale-95 transition-all group overflow-hidden border-2 border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <MessageSquare className="h-6 w-6" />
            </Button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
