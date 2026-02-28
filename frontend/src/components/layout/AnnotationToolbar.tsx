"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAppState, ToolMode } from "@/store/useAppState";
import {
  MousePointer2, Highlighter, Type, Crop, StickyNote, PenTool,
  Eraser, Undo, Redo, History, Save, Check, Download,
  Bold, Italic, List as ListIcon, Quote, Sparkles,
  ListOrdered, Strikethrough, Code, Underline,
  Minus, ZoomIn, ZoomOut, FileDown, Wand2, ChevronDown,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { exportAnnotatedPDF } from "@/lib/pdf-export";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToolItem<T = string> {
  id: T;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

// ─── Shared style helpers ─────────────────────────────────────────────────────

const toolGroupCls = "flex items-center gap-1 p-1 bg-secondary/50 rounded-2xl border border-white/10";
const toolBtnBase  = "h-10 w-10 rounded-xl transition-all duration-200";
const activeCls    = "bg-primary text-primary-foreground shadow-lg scale-110 ring-4 ring-primary/20";
const altActiveCls = "bg-foreground text-background shadow-lg scale-110";
const idleCls      = "text-muted-foreground hover:text-foreground hover:bg-background/80";

function Divider() {
  return <div className="w-px h-8 bg-border mx-1" />;
}

function ToolBtn({
  active, altActive, onClick, icon, label,
}: {
  active?: boolean; altActive?: boolean; onClick?: () => void;
  icon: React.ReactNode; label: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost" size="icon"
          onClick={onClick}
          className={cn(
            toolBtnBase,
            active ? activeCls : altActive ? altActiveCls : idleCls,
          )}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="rounded-lg font-bold text-[10px] uppercase tracking-wider mb-2">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Main Toolbar ─────────────────────────────────────────────────────────────

export function AnnotationToolbar() {
  const {
    toolMode, setToolMode,
    zoomIn, zoomOut, scale,
    strokeColor, setStrokeColor,
    undo, redo, history, future,
    versionHistory, saveVersion, restoreVersion,
    annotations, documents, activeDocumentId,
    activeTab,
  } = useAppState();

  const activeDoc = documents.find(d => d.id === activeDocumentId);
  const [versionName, setVersionName] = useState("");
  const [showVersionInput, setShowVersionInput] = useState(false);

  const handleSaveVersion = () => {
    if (!versionName.trim()) return;
    saveVersion(versionName);
    setVersionName("");
    setShowVersionInput(false);
  };

  // ── Don't render on assets or whiteboard (whiteboard has its own toolbar) ──
  if (activeTab === "assets" || activeTab === "whiteboard") return null;

  // ── Color presets ──
  const colors = [
    { name: "Teal",   value: "#0f766e" },
    { name: "Yellow", value: "#fde047" },
    { name: "Green",  value: "#86efac" },
    { name: "Blue",   value: "#93c5fd" },
    { name: "Purple", value: "#d8b4fe" },
    { name: "Red",    value: "#fca5a5" },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // DOCUMENT TAB
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeTab === "reader") {
    const annotationTools: ToolItem<ToolMode>[] = [
      { id: "select",    icon: <MousePointer2 className="h-4 w-4" />, label: "Select (V)" },
      { id: "highlight", icon: <Highlighter className="h-4 w-4" />,   label: "Highlight (H)" },
      { id: "text",      icon: <Type className="h-4 w-4" />,          label: "Add Text (T)" },
      { id: "sticky",    icon: <StickyNote className="h-4 w-4" />,    label: "Sticky Note (S)" },
      { id: "pen",       icon: <PenTool className="h-4 w-4" />,       label: "Draw (D)" },
      { id: "area",      icon: <Crop className="h-4 w-4" />,          label: "Area Select → AI (A)" },
      { id: "eraser",    icon: <Eraser className="h-4 w-4" />,        label: "Eraser (E)" },
    ];

    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-background/80 backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-primary/30 p-2.5 rounded-3xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-12">

        {/* Annotation Tools */}
        <div className={toolGroupCls}>
          {annotationTools.map(t => (
            <ToolBtn key={t.id} icon={t.icon} label={t.label}
              active={toolMode === t.id && t.id !== "select" && t.id !== "area" && t.id !== "eraser"}
              altActive={toolMode === t.id && (t.id === "select" || t.id === "area" || t.id === "eraser")}
              onClick={() => setToolMode(t.id)}
            />
          ))}

          {/* Inline color picker for applicable tools */}
          {(toolMode === "highlight" || toolMode === "pen" || toolMode === "text") && (
            <div className="flex items-center gap-1.5 pl-2 animate-in fade-in slide-in-from-left-4">
              <div className="w-px h-6 bg-border" />
              {colors.map(c => (
                <button key={c.value} onClick={() => setStrokeColor(c.value)}
                  className={cn(
                    "w-5 h-5 rounded-full transition-all duration-300 ring-offset-2 ring-offset-background/80",
                    strokeColor === c.value ? "ring-2 ring-primary scale-125 shadow-md" : "hover:scale-110 opacity-70 hover:opacity-100",
                  )}
                  style={{ backgroundColor: c.value }} title={c.name} />
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* Undo / Redo */}
        <div className={toolGroupCls}>
          <ToolBtn icon={<Undo className="h-4 w-4" />} label="Undo (⌘Z)"
            onClick={undo}
            active={false}
            altActive={false}
          />
          <ToolBtn icon={<Redo className="h-4 w-4" />} label="Redo (⌘⇧Z)"
            onClick={redo}
            active={false}
            altActive={false}
          />
        </div>

        {/* Version History */}
        <div className={toolGroupCls}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className={cn(toolBtnBase, idleCls)}>
                <History className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="top" className="w-64 mb-4 rounded-xl shadow-2xl p-2 border-white/10">
              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                Version History
                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/10 hover:text-primary rounded-full" onClick={() => setShowVersionInput(v => !v)}>
                  <Save className="h-3 w-3" />
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {showVersionInput && (
                <div className="p-2 flex gap-2 animate-in slide-in-from-top-2">
                  <Input placeholder="v1.0 Initial Notes" className="h-8 text-xs font-medium"
                    value={versionName} onChange={e => setVersionName(e.target.value)} autoFocus />
                  <Button size="icon" className="h-8 w-8 shrink-0 rounded-lg" onClick={handleSaveVersion}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="max-h-[300px] overflow-y-auto">
                {versionHistory.length === 0 ? (
                  <div className="p-4 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">No versions saved</div>
                ) : (
                  versionHistory.map(v => (
                    <DropdownMenuItem key={v.id} className="flex flex-col items-start p-3 rounded-lg cursor-pointer gap-0.5" onClick={() => restoreVersion(v.id)}>
                      <div className="font-bold text-sm tracking-tight">{v.name}</div>
                      <div className="text-[10px] opacity-50 uppercase tracking-tighter">
                        {new Date(v.timestamp).toLocaleString()} · {v.annotations.length} items
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Divider />

        {/* Zoom */}
        <div className={toolGroupCls}>
          <Button variant="ghost" size="icon" className={cn(toolBtnBase, idleCls)} onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="text-[10px] font-bold w-12 text-center text-muted-foreground tracking-widest uppercase tabular-nums">
            {Math.round(scale * 100)}%
          </div>
          <Button variant="ghost" size="icon" className={cn(toolBtnBase, idleCls)} onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Export */}
        <div className={toolGroupCls}>
          <ToolBtn icon={<FileDown className="h-4 w-4" />} label="Export Annotated PDF"
            onClick={() => activeDoc && exportAnnotatedPDF(activeDoc.url, annotations)}
          />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RESEARCH NOTES TAB
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeTab === "notes") {
    const exec = (cmd: string, val?: string) => {
      document.execCommand(cmd, false, val);
    };

    // Check active state for toggle commands
    const isActive = (cmd: string) => {
      try { return document.queryCommandState(cmd); } catch { return false; }
    };

    const noteColors = [
      { label: "Default", val: "#000000", bg: "bg-zinc-800" },
      { label: "Blue",    val: "#2563eb", bg: "bg-blue-600" },
      { label: "Red",     val: "#dc2626", bg: "bg-red-500" },
      { label: "Green",   val: "#16a34a", bg: "bg-green-600" },
      { label: "Purple",  val: "#9333ea", bg: "bg-purple-500" },
    ];
    const highlights = [
      { label: "Yellow",  val: "#fef08a", bg: "bg-yellow-200" },
      { label: "Green",   val: "#bbf7d0", bg: "bg-green-200" },
      { label: "Blue",    val: "#bfdbfe", bg: "bg-blue-200" },
      { label: "Pink",    val: "#fbcfe8", bg: "bg-pink-200" },
    ];

    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-primary/30 p-2 rounded-3xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-12">

        {/* ── Select / Area ── */}
        <div className={toolGroupCls}>
          <ToolBtn icon={<MousePointer2 className="h-4 w-4" />} label="Select" altActive={toolMode === "select"} onClick={() => setToolMode("select")} />
          <ToolBtn icon={<Crop className="h-4 w-4" />} label="Area Select → AI" altActive={toolMode === "area"} onClick={() => setToolMode("area")} />
        </div>

        <Divider />

        {/* ── Headings ── */}
        <div className={toolGroupCls}>
          {(["H1","H2","H3"] as const).map(h => (
            <Tooltip key={h}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(toolBtnBase, idleCls)}
                  onClick={() => exec("formatBlock", h)}>
                  <span className={cn("font-black", h === "H1" ? "text-[12px]" : h === "H2" ? "text-[11px]" : "text-[10px]")}>{h}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="mb-2 text-[10px] font-bold uppercase tracking-wider">{h} Heading</TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Divider />

        {/* ── Inline Formatting (with active states) ── */}
        <div className={toolGroupCls}>
          <ToolBtn icon={<Bold className="h-4 w-4" />}          label="Bold (⌘B)"          active={isActive("bold")}          onClick={() => exec("bold")} />
          <ToolBtn icon={<Italic className="h-4 w-4" />}        label="Italic (⌘I)"        active={isActive("italic")}        onClick={() => exec("italic")} />
          <ToolBtn icon={<Underline className="h-4 w-4" />}     label="Underline (⌘U)"     active={isActive("underline")}     onClick={() => exec("underline")} />
          <ToolBtn icon={<Strikethrough className="h-4 w-4" />} label="Strikethrough"       active={isActive("strikeThrough")} onClick={() => exec("strikeThrough")} />
          <ToolBtn icon={<Code className="h-4 w-4" />}          label="Inline Code"                                            onClick={() => exec("insertHTML", `<code style="background:rgba(135,131,120,.15);border-radius:3px;padding:.1em .4em;font-family:monospace">${window.getSelection()?.toString() || "code"}</code>`)} />
        </div>

        <Divider />

        {/* ── Block Formatting ── */}
        <div className={toolGroupCls}>
          <ToolBtn icon={<ListIcon className="h-4 w-4" />}    label="Bullet List"    active={isActive("insertUnorderedList")} onClick={() => exec("insertUnorderedList")} />
          <ToolBtn icon={<ListOrdered className="h-4 w-4" />} label="Numbered List"  active={isActive("insertOrderedList")}   onClick={() => exec("insertOrderedList")} />
          <ToolBtn icon={<Quote className="h-4 w-4" />}       label="Quote Block"                                              onClick={() => exec("formatBlock", "BLOCKQUOTE")} />
          <ToolBtn icon={<Minus className="h-4 w-4" />}       label="Divider"                                                  onClick={() => exec("insertHTML", '<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/><p><br></p>')} />
        </div>

        <Divider />

        {/* ── Text Color Dropup ── */}
        <div className={toolGroupCls}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn(toolBtnBase, idleCls, "w-auto px-2.5 gap-1.5 text-[10px] font-bold")}>
                <span className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-300" />
                <span>A</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="center" className="p-2 mb-2 rounded-xl shadow-2xl min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1 mb-2">Text Color</p>
              <div className="flex gap-2 flex-wrap w-32">
                {noteColors.map(c => (
                  <button key={c.val}
                    className={cn("w-6 h-6 rounded-full border-2 border-transparent hover:scale-125 hover:border-primary/50 transition-all", c.bg)}
                    onMouseDown={e => { e.preventDefault(); exec("foreColor", c.val); }}
                    title={c.label}
                  />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ── Highlight Color Dropup ── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn(toolBtnBase, idleCls, "w-auto px-2.5 gap-1.5 text-[10px] font-bold")}>
                <Highlighter className="h-3.5 w-3.5" />
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="center" className="p-2 mb-2 rounded-xl shadow-2xl min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1 mb-2">Highlight</p>
              <div className="flex gap-2 flex-wrap w-28">
                {highlights.map(c => (
                  <button key={c.val}
                    className={cn("w-6 h-6 rounded-full border border-zinc-200 hover:scale-125 transition-all", c.bg)}
                    onMouseDown={e => { e.preventDefault(); exec("hiliteColor", c.val); }}
                    title={c.label}
                  />
                ))}
                <button
                  className="w-6 h-6 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center hover:scale-125 transition-all text-zinc-400 text-[9px] font-black"
                  onMouseDown={e => { e.preventDefault(); exec("hiliteColor", "transparent"); }}
                  title="Remove highlight"
                >×</button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Divider />

        {/* ── AI + Save ── */}
        <div className={toolGroupCls}>
          <ToolBtn icon={<Wand2 className="h-4 w-4" />} label="AI Enhance Selection" />
          <ToolBtn icon={<Save className="h-4 w-4" />}  label="Save Notes" />
        </div>
      </div>
    );
  }

  return null;
}
