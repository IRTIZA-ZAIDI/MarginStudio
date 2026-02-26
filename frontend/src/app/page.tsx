"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { AnnotationToolbar } from "@/components/layout/AnnotationToolbar";
import { MagicToolbar } from "@/components/layout/MagicToolbar";
import { SplitView } from "@/components/layout/SplitView";
import { AISidebar } from "@/components/ai-sidebar/AISidebar";
import { LandingPage } from "@/components/layout/LandingPage";
import { AssetDisplay } from "@/components/layout/AssetDisplay";
import { useAppState } from "@/store/useAppState";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { BookOpen, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const PDFRenderer = dynamic(() => import("@/components/pdf-stage/PDFRenderer").then(mod => mod.PDFRenderer), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse text-muted-foreground bg-background">Calibrating Studio...</div>
});

export default function Home() {
  const { fileUrl, assets, isSidebarOpen, toggleSidebar, activeTab, setActiveTab } = useAppState();

  if (!fileUrl) {
    return <LandingPage />;
  }

  return (
    <div className="flex bg-background font-sans h-screen flex-col overflow-hidden text-foreground">
      <Header />
      <AnnotationToolbar />
      <div className="flex-1 overflow-hidden relative">
        {/* Magic Toolbar will float over the active view */}

        <SplitView
          left={
            <div className="h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 border-r relative flex flex-col transition-all">
               
               {/* Top Tabs for View Switching */}
               <div className="flex bg-secondary p-1 rounded-full w-max mx-auto mt-6 mb-4 shadow-sm border border-border shrink-0 z-40 relative">
                 <button 
                   onClick={() => setActiveTab('reader')} 
                   className={cn("px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all", activeTab === 'reader' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-background')}
                 >
                   PDF Document
                 </button>
                 <button 
                   onClick={() => setActiveTab('assets')} 
                   className={cn("px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex gap-2 items-center transition-all", activeTab === 'assets' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-background')}
                 >
                   Magic Assets 
                   {assets.length > 0 && <span className="bg-primary/20 text-primary px-1.5 rounded-sm h-4 flex items-center justify-center text-[10px]">{assets.length}</span>}
                 </button>
               </div>

               <div className="flex-1 overflow-auto relative custom-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:32px_32px]">
                   <MagicToolbar />
                   {activeTab === 'reader' ? (
                       <div className="min-h-screen pb-32">
                          <PDFRenderer url={fileUrl} />
                       </div>
                   ) : (
                       <AssetDisplay />
                   )}
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
  );
}
