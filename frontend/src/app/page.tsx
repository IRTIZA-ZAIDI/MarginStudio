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
import { BookOpen, Sparkles } from "lucide-react";

const PDFRenderer = dynamic(() => import("@/components/pdf-stage/PDFRenderer").then(mod => mod.PDFRenderer), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse text-muted-foreground bg-background">Calibrating Studio...</div>
});

export default function Home() {
  const { fileUrl, assets } = useAppState();
  const [activeView, setActiveView] = useState<'reader' | 'assets'>('reader');

  if (!fileUrl) {
    return <LandingPage />;
  }

  // Auto-switch to assets if first one is generated
  const handleViewChange = (view: 'reader' | 'assets') => setActiveView(view);

  return (
    <div className="flex bg-background font-sans h-screen flex-col overflow-hidden text-foreground">
      <Header />
      <AnnotationToolbar />
      <div className="flex-1 overflow-hidden relative">
        <MagicToolbar />
        
        {/* View Toggle (Floating) */}
        {assets.length > 0 && (
            <div className="absolute top-1/2 left-20 -translate-y-1/2 flex flex-col gap-2 z-[70] animate-in fade-in slide-in-from-left-4 duration-500">
                <button 
                    onClick={() => setActiveView('reader')}
                    className={cn(
                        "p-3 rounded-full shadow-2xl transition-all border",
                        activeView === 'reader' ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:bg-secondary"
                    )}
                    title="PDF Reader"
                >
                    <BookOpen className="h-5 w-5" />
                </button>
                <button 
                    onClick={() => setActiveView('assets')}
                    className={cn(
                        "p-3 rounded-full shadow-2xl transition-all border",
                        activeView === 'assets' ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:bg-secondary"
                    )}
                    title="Studio Assets"
                >
                    <Sparkles className="h-5 w-5" />
                </button>
            </div>
        )}

        <SplitView
          left={
            <div className="h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 border-r relative flex flex-col transition-all">
               {activeView === 'reader' ? (
                   <div className="flex-1 overflow-auto relative custom-scrollbar p-8 pt-4">
                      <PDFRenderer url={fileUrl} />
                   </div>
               ) : (
                   <AssetDisplay />
               )}
            </div>
          }
          right={
            <div className="h-full bg-background border-l shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
              <AISidebar />
            </div>
          }
        />
      </div>
    </div>
  );
}
