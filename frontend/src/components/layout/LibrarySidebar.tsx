"use client";

import { useAppState, Document } from "@/store/useAppState";
import { cn } from "@/lib/utils";
import { 
    FileText, Plus, Search, Library, 
    MoreVertical, Trash2, ExternalLink,
    ChevronLeft, ChevronRight, HardDrive,
    Clock, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";

export function LibrarySidebar() {
  const { 
    documents, activeDocumentId, setActiveDocument, 
    addDocument, isLibraryOpen, toggleLibrary,
    workspaces, activeWorkspaceId
  } = useAppState();
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeWS = workspaces.find(w => w.id === activeWorkspaceId);
  const workspaceDocs = (activeWS?.documentIds || [])
    .map(id => documents.find(d => d.id === id))
    .filter((d): d is Document => !!d);

  const filteredDocs = workspaceDocs.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => {
        if (file.type === "application/pdf") {
          const url = URL.createObjectURL(file);
          const id = Math.random().toString(36).substr(2, 9);
          addDocument({
            id,
            name: file.name,
            url
          });
        }
      });
    }
  };

  if (!isLibraryOpen) {
    return (
        <div className="h-full w-12 border-r bg-card/30 flex flex-col items-center py-4 gap-4 animate-in slide-in-from-left duration-300">
            <Button variant="ghost" size="icon" onClick={toggleLibrary} className="rounded-xl">
                <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="h-px w-6 bg-border" />
            <Library className="h-4 w-4 text-muted-foreground/50" />
            <div className="flex-1" />
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="rounded-xl hover:text-primary">
                <Plus className="h-4 w-4" />
            </Button>
            <input 
                type="file" 
                multiple 
                accept="application/pdf" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
            />
        </div>
    );
  }

  return (
    <div className="h-full w-72 border-r bg-card/50 flex flex-col animate-in slide-in-from-left duration-300">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Library className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-sm font-black uppercase tracking-[0.15em]">Library</h2>
                    <p className="text-[10px] text-muted-foreground font-bold">{documents.length} Documents</p>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleLibrary} className="rounded-lg h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
            </Button>
        </div>

        <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
            <Input 
                placeholder="Search PDF names..." 
                className="pl-9 h-10 bg-secondary/30 border-transparent focus:border-border transition-all text-xs font-medium rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1">
        <div className="px-2 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Work Documents</div>
        
        {filteredDocs.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setActiveDocument(doc.id)}
            className={cn(
                "w-full group flex items-start gap-3 p-3 rounded-2xl transition-all text-left relative border border-transparent",
                activeDocumentId === doc.id 
                    ? "bg-background border-border shadow-sm ring-1 ring-border/50" 
                    : "hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
                "mt-0.5 p-2 rounded-lg transition-colors",
                activeDocumentId === doc.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground/50 group-hover:bg-background"
            )}>
                <FileText className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold truncate leading-tight mb-0.5">{doc.name}</div>
                <div className="flex items-center gap-2 text-[9px] font-medium opacity-60">
                    <span className="flex items-center gap-1"><HardDrive className="h-2.5 w-2.5" /> 2.4 MB</span>
                    <span className="flex items-center gap-1 underline">v1.2</span>
                </div>
            </div>
            {activeDocumentId === doc.id && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
            )}
          </button>
        ))}

        {filteredDocs.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4 opacity-50">
                <Search className="h-8 w-8 mb-3 text-muted-foreground/20" />
                <p className="text-[11px] font-bold uppercase tracking-widest">No documents found</p>
                <p className="text-[10px] font-medium leading-relaxed max-w-[150px] mt-1">Try adjusting your search or upload new files.</p>
            </div>
        )}
      </div>

      {/* Footer / Upload */}
      <div className="p-4 bg-secondary/10 border-t border-border/50">
         <Button 
            className="w-full h-12 rounded-2xl gap-3 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-transform active:scale-95"
            onClick={() => fileInputRef.current?.click()}
         >
            <Plus className="h-4 w-4" />
            Import Document
         </Button>
         <input 
            type="file" 
            multiple 
            accept="application/pdf" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
         />
      </div>
    </div>
  );
}
