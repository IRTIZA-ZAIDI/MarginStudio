"use client";

import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Database, Sparkles, Languages, FileSearch, Terminal,
  Zap, GitBranch, Network, Code, Mail, Globe, Filter,
  Webhook, Timer, Play, Plus, Trash2, Settings, X,
  ZoomIn, ZoomOut, Maximize2, MousePointer2, Hand,
  LayoutDashboard, ChevronRight, Search, CheckCircle2, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

type NodeStatus = "idle" | "running" | "success" | "error";

interface WFNode {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  x: number;
  y: number;
  status: NodeStatus;
  category: string;
}

interface WFConnection {
  id: string;
  fromId: string;
  toId: string;
}

interface NodeTemplate {
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  category: string;
}

// ─── Node Templates (left panel library) ─────────────────────────────────────

const NODE_LIBRARY: { category: string; nodes: NodeTemplate[] }[] = [
  {
    category: "Triggers",
    nodes: [
      { label: "PDF Upload",    subtitle: "On new document",     icon: <Database className="h-4 w-4" />,   color: "#0d9488", category: "Triggers" },
      { label: "Webhook",       subtitle: "HTTP trigger",        icon: <Webhook className="h-4 w-4" />,    color: "#0d9488", category: "Triggers" },
      { label: "Schedule",      subtitle: "Cron expression",     icon: <Timer className="h-4 w-4" />,      color: "#0d9488", category: "Triggers" },
    ]
  },
  {
    category: "AI Models",
    nodes: [
      { label: "LLM Agent",     subtitle: "Claude / GPT / Gemini", icon: <Sparkles className="h-4 w-4" />,  color: "#8b5cf6", category: "AI Models" },
      { label: "Summarizer",    subtitle: "Deep context model",    icon: <Code className="h-4 w-4" />,       color: "#8b5cf6", category: "AI Models" },
      { label: "Translator",    subtitle: "Multi-language engine", icon: <Languages className="h-4 w-4" />,  color: "#ec4899", category: "AI Models" },
      { label: "Classifier",    subtitle: "Entity & intent",       icon: <Filter className="h-4 w-4" />,     color: "#8b5cf6", category: "AI Models" },
    ]
  },
  {
    category: "Logic",
    nodes: [
      { label: "If / Else",     subtitle: "Conditional branch",    icon: <GitBranch className="h-4 w-4" />, color: "#f59e0b", category: "Logic" },
      { label: "Filter",        subtitle: "Array filter",          icon: <Filter className="h-4 w-4" />,    color: "#f59e0b", category: "Logic" },
      { label: "Loop",          subtitle: "Iterate items",         icon: <Network className="h-4 w-4" />,   color: "#f59e0b", category: "Logic" },
    ]
  },
  {
    category: "Outputs",
    nodes: [
      { label: "Knowledge Base",subtitle: "Vector store",         icon: <Database className="h-4 w-4" />,   color: "#10b981", category: "Outputs" },
      { label: "Send Email",    subtitle: "SMTP / SendGrid",      icon: <Mail className="h-4 w-4" />,       color: "#10b981", category: "Outputs" },
      { label: "HTTP Request",  subtitle: "REST API call",        icon: <Globe className="h-4 w-4" />,      color: "#3b82f6", category: "Outputs" },
      { label: "Code Script",   subtitle: "JS / Python",          icon: <Terminal className="h-4 w-4" />,   color: "#10b981", category: "Outputs" },
    ]
  }
];

// ─── Utility  ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10);

const NODE_W = 200;
const NODE_H = 64;

function portPos(node: WFNode, side: "left" | "right") {
  return {
    x: side === "left" ? node.x : node.x + NODE_W,
    y: node.y + NODE_H / 2,
  };
}

function bezierPath(x1: number, y1: number, x2: number, y2: number) {
  const cp = Math.abs(x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${x1 + cp} ${y1}, ${x2 - cp} ${y2}, ${x2} ${y2}`;
}

// ─── Node Card ────────────────────────────────────────────────────────────────

function NodeCard({
  node, selected, isConnectingFrom,
  onMouseDown, onPortMouseDown, onPortMouseUp,
  onDelete,
}: {
  node: WFNode;
  selected: boolean;
  isConnectingFrom: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onPortMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onPortMouseUp: (e: React.MouseEvent, nodeId: string) => void;
  onDelete: () => void;
}) {
  const statusRing: Record<NodeStatus, string> = {
    idle: "",
    running: "ring-2 ring-primary ring-offset-2 dark:ring-offset-zinc-900",
    success: "ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-zinc-900",
    error:   "ring-2 ring-red-400 ring-offset-2 dark:ring-offset-zinc-900",
  };
  const statusDot: Record<NodeStatus, string> = {
    idle: "bg-zinc-300",
    running: "bg-primary animate-ping",
    success: "bg-emerald-400",
    error: "bg-red-400",
  };

  return (
    <div
      style={{ left: node.x, top: node.y, position: "absolute", width: NODE_W }}
      className={cn(
        "bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg transition-all group flex items-stretch overflow-visible cursor-grab active:cursor-grabbing select-none",
        selected && "ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-zinc-950 shadow-2xl",
        isConnectingFrom && "ring-2 ring-primary ring-dashed ring-offset-2",
        statusRing[node.status]
      )}
      onMouseDown={onMouseDown}
    >
      {/* Left color bar */}
      <div className="w-1.5 shrink-0 rounded-l-xl" style={{ backgroundColor: node.color }} />

      {/* Body */}
      <div className="flex-1 p-3 flex items-center gap-3 overflow-hidden" style={{ minHeight: NODE_H }}>
        <div className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 group-hover:border-slate-300 transition-colors">
          <span style={{ color: node.color }}>{node.icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold tracking-tight leading-tight truncate">{node.label}</div>
          <div className="text-[9px] font-medium text-muted-foreground/50 truncate">{node.subtitle}</div>
        </div>
        {/* Status dot */}
        <div className={cn("w-1.5 h-1.5 shrink-0 rounded-full", statusDot[node.status])} />
      </div>

      {/* Input port (left) */}
      <div
        className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-5 h-5 rounded-full bg-white dark:bg-zinc-950 border-2 border-slate-200 dark:border-slate-700 group-hover:border-indigo-400 transition-colors cursor-crosshair z-20 flex items-center justify-center hover:scale-125"
        onMouseUp={e => { e.stopPropagation(); onPortMouseUp(e, node.id); }}
        title="Input"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
      </div>

      {/* Output port (right) */}
      <div
        className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-5 h-5 rounded-full bg-white dark:bg-zinc-950 border-2 border-slate-200 dark:border-slate-700 group-hover:border-indigo-400 transition-colors cursor-crosshair z-20 flex items-center justify-center hover:scale-125 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
        onMouseDown={e => { e.stopPropagation(); onPortMouseDown(e, node.id); }}
        title="Output – drag to connect"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
      </div>

      {/* Delete on hover */}
      {selected && (
        <button
          className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg border-2 border-background hover:scale-110 transition-transform z-30"
          onMouseDown={e => { e.stopPropagation(); onDelete(); }}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// ─── Main WorkflowCanvas ──────────────────────────────────────────────────────

export function WorkflowCanvas() {
  const [nodes, setNodes] = useState<WFNode[]>([
    { id: "1", label: "PDF Upload",    subtitle: "Workspace Assets",    icon: <Database className="h-4 w-4" />,  color: "#0d9488", x: 80,  y: 230, status: "success", category: "Triggers" },
    { id: "2", label: "LLM Agent",     subtitle: "Claude-3.5-Sonnet",   icon: <Sparkles className="h-4 w-4" />,  color: "#8b5cf6", x: 380, y: 130, status: "idle",    category: "AI Models" },
    { id: "3", label: "Translator",    subtitle: "Universal Engine",    icon: <Languages className="h-4 w-4" />, color: "#ec4899", x: 380, y: 330, status: "running", category: "AI Models" },
    { id: "4", label: "If / Else",     subtitle: "Check confidence",    icon: <GitBranch className="h-4 w-4" />, color: "#f59e0b", x: 680, y: 230, status: "idle",    category: "Logic" },
    { id: "5", label: "Knowledge Base",subtitle: "Vector Index",        icon: <Database className="h-4 w-4" />,  color: "#10b981", x: 980, y: 230, status: "idle",    category: "Outputs" },
  ]);

  const [connections, setConnections] = useState<WFConnection[]>([
    { id: "c1", fromId: "1", toId: "2" },
    { id: "c2", fromId: "1", toId: "3" },
    { id: "c3", fromId: "2", toId: "4" },
    { id: "c4", fromId: "3", toId: "4" },
    { id: "c5", fromId: "4", toId: "5" },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 80, y: 60 });
  const [search, setSearch] = useState("");
  const [libOpen, setLibOpen] = useState(true);

  // Drag state
  const dragging  = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const panning   = useRef(false);
  const panStart  = useRef({ x: 0, y: 0 });
  const panBase   = useRef({ x: 0, y: 0 });

  // Connection drawing state
  const connecting = useRef<string | null>(null);
  const [ghostLine, setGhostLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  const svgRef = useRef<HTMLDivElement>(null);

  const toWorld = useCallback((cx: number, cy: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (cx - rect.left) / zoom - pan.x,
      y: (cy - rect.top)  / zoom - pan.y,
    };
  }, [zoom, pan]);

  // ── Drag Node ──────────────────────────────────
  const onNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === id)!;
    const wp = toWorld(e.clientX, e.clientY);
    dragging.current = { id, ox: wp.x - node.x, oy: wp.y - node.y };
    setSelectedId(id);
  };

  // ── Start Connection ───────────────────────────
  const onPortMouseDown = (e: React.MouseEvent, fromId: string) => {
    e.preventDefault();
    connecting.current = fromId;
    const wp = toWorld(e.clientX, e.clientY);
    const node = nodes.find(n => n.id === fromId)!;
    const p = portPos(node, "right");
    setGhostLine({ x1: p.x, y1: p.y, x2: wp.x, y2: wp.y });
  };

  // ── Complete Connection ────────────────────────
  const onPortMouseUp = (e: React.MouseEvent, toId: string) => {
    if (!connecting.current || connecting.current === toId) { connecting.current = null; setGhostLine(null); return; }
    const exists = connections.find(c => c.fromId === connecting.current && c.toId === toId);
    if (!exists) {
      setConnections(cs => [...cs, { id: uid(), fromId: connecting.current!, toId }]);
    }
    connecting.current = null;
    setGhostLine(null);
  };

  // ── Canvas Mouse Move ──────────────────────────
  const onMouseMove = (e: React.MouseEvent) => {
    const wp = toWorld(e.clientX, e.clientY);

    if (dragging.current) {
      const { id, ox, oy } = dragging.current;
      setNodes(ns => ns.map(n => n.id === id ? { ...n, x: wp.x - ox, y: wp.y - oy } : n));
    }

    if (panning.current) {
      const dx = (e.clientX - panStart.current.x) / zoom;
      const dy = (e.clientY - panStart.current.y) / zoom;
      setPan({ x: panBase.current.x + dx, y: panBase.current.y + dy });
    }

    if (connecting.current) {
      const node = nodes.find(n => n.id === connecting.current)!;
      const p = portPos(node, "right");
      setGhostLine({ x1: p.x, y1: p.y, x2: wp.x, y2: wp.y });
    }
  };

  const onMouseUp = () => {
    dragging.current = null;
    panning.current = false;
    connecting.current = null;
    setGhostLine(null);
  };

  const onCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.altKey) {
      panning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      panBase.current = { ...pan };
    } else {
      setSelectedId(null);
    }
  };

  // ── Wheel zoom ─────────────────────────────────
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(z => Math.max(0.25, Math.min(3, z * (e.deltaY < 0 ? 1.08 : 0.93))));
      } else {
        setPan(p => ({ x: p.x - e.deltaX / zoom, y: p.y - e.deltaY / zoom }));
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [zoom]);

  // ── Add node from library ──────────────────────
  const addNode = (tpl: NodeTemplate) => {
    const newNode: WFNode = {
      id: uid(),
      label: tpl.label,
      subtitle: tpl.subtitle,
      icon: tpl.icon,
      color: tpl.color,
      x: 300 + Math.random() * 300,
      y: 100 + Math.random() * 300,
      status: "idle",
      category: tpl.category,
    };
    setNodes(ns => [...ns, newNode]);
  };

  // ── Delete selected ────────────────────────────
  const deleteNode = (id: string) => {
    setNodes(ns => ns.filter(n => n.id !== id));
    setConnections(cs => cs.filter(c => c.fromId !== id && c.toId !== id));
    setSelectedId(null);
  };

  // ── Delete connection ──────────────────────────
  const deleteConnection = (id: string) => {
    setConnections(cs => cs.filter(c => c.id !== id));
  };

  // ── Run all (demo) ─────────────────────────────
  const runFlow = () => {
    setNodes(ns => ns.map(n => ({ ...n, status: "running" })));
    setTimeout(() => setNodes(ns => ns.map(n => ({ ...n, status: "success" }))), 2000);
  };

  // ── Filtered library ───────────────────────────
  const filteredLib = NODE_LIBRARY.map(cat => ({
    ...cat,
    nodes: cat.nodes.filter(n =>
      n.label.toLowerCase().includes(search.toLowerCase()) ||
      n.subtitle.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.nodes.length > 0);

  const svgWidth = 4000;
  const svgHeight = 3000;

  return (
    <div className="h-full w-full flex overflow-hidden bg-[#f8fafc] dark:bg-[#020617] relative font-sans" style={{ height: "calc(100vh - 7rem)" }}>

      {/* ── Left Node Library Panel ── */}
      <div className={cn(
        "h-full shrink-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-30 transition-all duration-300",
        libOpen ? "w-64" : "w-0 overflow-hidden"
      )}>
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Node Library</p>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400" />
            <input
              className="w-full pl-7 pr-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 ring-indigo-500/30"
              placeholder="Search nodes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {filteredLib.map(cat => (
            <div key={cat.category}>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1 mb-2">{cat.category}</p>
              <div className="space-y-1">
                {cat.nodes.map(tpl => (
                  <button
                    key={tpl.label}
                    onClick={() => addNode(tpl)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left group"
                  >
                    <div className="h-7 w-7 shrink-0 rounded-md flex items-center justify-center border border-zinc-200 dark:border-zinc-700 group-hover:border-zinc-300 transition-colors"
                      style={{ backgroundColor: tpl.color + "20" }}>
                      <span style={{ color: tpl.color }}>{tpl.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate">{tpl.label}</p>
                      <p className="text-[9px] text-zinc-400 truncate">{tpl.subtitle}</p>
                    </div>
                    <Plus className="h-3 w-3 text-zinc-300 group-hover:text-indigo-400 ml-auto shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Canvas Area ── */}
      <div className="flex-1 flex flex-col relative overflow-hidden">

        {/* Top toolbar */}
        <div className="h-14 shrink-0 flex items-center justify-between px-5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLibOpen(o => !o)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-zinc-400" />
            </button>
            <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex items-center gap-1 p-1 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <button onClick={() => setZoom(z => Math.max(0.25, z - 0.1))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white dark:hover:bg-zinc-700 transition-colors">
                <ZoomOut className="h-3.5 w-3.5 text-zinc-400" />
              </button>
              <button onClick={() => { setZoom(1); setPan({ x: 80, y: 60 }); }}
                className="text-[10px] font-bold text-zinc-500 px-2 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors tabular-nums">
                {Math.round(zoom * 100)}%
              </button>
              <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white dark:hover:bg-zinc-700 transition-colors">
                <ZoomIn className="h-3.5 w-3.5 text-zinc-400" />
              </button>
            </div>
            <div className="text-[10px] font-bold text-zinc-400 hidden md:block">
              Alt+Drag to pan · Scroll to pan · Ctrl+Scroll to zoom · Drag ports to connect
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runFlow}
              className="flex items-center gap-2 h-9 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/30"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Execute Flow
            </button>
          </div>
        </div>

        {/* Grid + Canvas */}
        <div
          ref={svgRef}
          className="flex-1 relative overflow-hidden cursor-default"
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseDown={onCanvasMouseDown}
          onMouseLeave={onMouseUp}
        >
          {/* n8n dot grid */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <defs>
              <pattern id="wf-grid" width={24 * zoom} height={24 * zoom} patternUnits="userSpaceOnUse"
                x={(pan.x * zoom) % (24 * zoom)} y={(pan.y * zoom) % (24 * zoom)}>
                <circle cx={1} cy={1} r={0.8} fill="#cbd5e1" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wf-grid)" />
          </svg>

          {/* Connection SVG */}
          <svg
            className="absolute inset-0 pointer-events-none overflow-visible"
            style={{ width: "100%", height: "100%", zIndex: 5 }}
          >
            <defs>
              <marker id="wf-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
              </marker>
              <marker id="wf-arrow-hover" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
              </marker>
            </defs>
            <g transform={`translate(${pan.x * zoom}, ${pan.y * zoom}) scale(${zoom})`}>
              {connections.map(conn => {
                const from = nodes.find(n => n.id === conn.fromId);
                const to   = nodes.find(n => n.id === conn.toId);
                if (!from || !to) return null;
                const p1 = portPos(from, "right");
                const p2 = portPos(to,   "left");
                return (
                  <g key={conn.id} className="group/conn">
                    {/* Wide invisible hit area */}
                    <path
                      d={bezierPath(p1.x, p1.y, p2.x, p2.y)}
                      fill="none" stroke="transparent" strokeWidth={16}
                      className="pointer-events-auto cursor-pointer"
                      onClick={() => deleteConnection(conn.id)}
                    />
                    {/* Visible path */}
                    <path
                      d={bezierPath(p1.x, p1.y, p2.x, p2.y)}
                      fill="none" stroke="#cbd5e1" strokeWidth={2}
                      className="group-hover/conn:stroke-indigo-400 transition-colors"
                      markerEnd="url(#wf-arrow)"
                    />
                  </g>
                );
              })}

              {/* Ghost line while connecting */}
              {ghostLine && (
                <path
                  d={bezierPath(ghostLine.x1, ghostLine.y1, ghostLine.x2, ghostLine.y2)}
                  fill="none" stroke="#6366f1" strokeWidth={2} strokeDasharray="6,4"
                  className="animate-pulse pointer-events-none"
                />
              )}
            </g>
          </svg>

          {/* Nodes layer */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 10 }}
          >
            <div
              className="absolute pointer-events-auto"
              style={{ transform: `translate(${pan.x * zoom}px, ${pan.y * zoom}px) scale(${zoom})`, transformOrigin: "0 0" }}
            >
              {nodes.map(node => (
                <NodeCard
                  key={node.id}
                  node={node}
                  selected={selectedId === node.id}
                  isConnectingFrom={connecting.current === node.id}
                  onMouseDown={e => onNodeMouseDown(e, node.id)}
                  onPortMouseDown={onPortMouseDown}
                  onPortMouseUp={onPortMouseUp}
                  onDelete={() => deleteNode(node.id)}
                />
              ))}
            </div>
          </div>

          {/* Empty state hint */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <Network className="h-16 w-16 mx-auto text-zinc-200 dark:text-zinc-800 mb-4" />
                <p className="text-sm font-bold text-zinc-400 dark:text-zinc-600">Add nodes from the panel on the left</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom status bar */}
        <div className="h-9 shrink-0 flex items-center px-5 gap-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 z-20">
          <span>{nodes.length} Nodes</span>
          <span>·</span>
          <span>{connections.length} Connections</span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <div className={cn("w-1.5 h-1.5 rounded-full",
              nodes.some(n => n.status === "running") ? "bg-primary animate-pulse" :
              nodes.every(n => n.status === "success") ? "bg-emerald-400" : "bg-zinc-300"
            )} />
            {nodes.some(n => n.status === "running") ? "Running…" :
             nodes.every(n => n.status === "success") ? "All Complete" : "Idle"}
          </span>
          <span className="ml-auto">Click a connection to delete it · Drag output port to connect</span>
        </div>
      </div>
    </div>
  );
}
