"use client";

import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useCallback, useId } from "react";
import {
  MousePointer2, Pencil, Square, Circle, Diamond, ArrowRight,
  Minus, Type, Hand, Eraser, Trash2, ZoomIn, ZoomOut,
  RotateCcw, RotateCw, Download, Grid, Move, Crop, Sparkles
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tool = "select" | "area" | "hand" | "pencil" | "rect" | "ellipse" | "diamond" | "arrow" | "line" | "text" | "eraser";

interface Point { x: number; y: number; }

interface CanvasElement {
  id: string;
  type: "rect" | "ellipse" | "diamond" | "arrow" | "line" | "pencil" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  roughness: number;     // 0 = sharp, 1 = rough
  points?: Point[];      // pencil strokes
  text?: string;
  fontSize?: number;
  angle?: number;        // degrees
}

// ─── Utility ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10);
const GRID = 20;

function snap(v: number) { return Math.round(v / GRID) * GRID; }

function normRect(x: number, y: number, w: number, h: number) {
  return {
    x: w < 0 ? x + w : x,
    y: h < 0 ? y + h : y,
    width: Math.abs(w),
    height: Math.abs(h),
  };
}

function ptInRect(px: number, py: number, el: CanvasElement, pad = 6) {
  const { x, y, width: w, height: h } = el;
  return px >= x - pad && px <= x + w + pad && py >= y - pad && py <= y + h + pad;
}

function ptInPencil(px: number, py: number, points: Point[], tol = 8) {
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) continue;
    const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / len2));
    const nx = a.x + t * dx - px, ny = a.y + t * dy - py;
    if (nx * nx + ny * ny < tol * tol) return true;
  }
  return false;
}

function hitElement(px: number, py: number, el: CanvasElement): boolean {
  if (el.type === "pencil") return ptInPencil(px, py, el.points ?? []);
  if (el.type === "line" || el.type === "arrow") {
    const x2 = el.x + el.width, y2 = el.y + el.height;
    const dx = x2 - el.x, dy = y2 - el.y;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return false;
    const t = Math.max(0, Math.min(1, ((px - el.x) * dx + (py - el.y) * dy) / len2));
    const nx = el.x + t * dx - px, ny = el.y + t * dy - py;
    return nx * nx + ny * ny < 64;
  }
  return ptInRect(px, py, el);
}

function resizeHandles(el: CanvasElement): { id: string; cx: number; cy: number }[] {
  if (el.type === "pencil" || el.type === "text") return [];
  if (el.type === "line" || el.type === "arrow") {
    return [
      { id: "start", cx: el.x, cy: el.y },
      { id: "end",   cx: el.x + el.width, cy: el.y + el.height },
    ];
  }
  const { x, y, width: w, height: h } = el;
  return [
    { id: "nw", cx: x,         cy: y },
    { id: "n",  cx: x + w / 2, cy: y },
    { id: "ne", cx: x + w,     cy: y },
    { id: "e",  cx: x + w,     cy: y + h / 2 },
    { id: "se", cx: x + w,     cy: y + h },
    { id: "s",  cx: x + w / 2, cy: y + h },
    { id: "sw", cx: x,         cy: y + h },
    { id: "w",  cx: x,         cy: y + h / 2 },
  ];
}

// ─── Rough-ish SVG helpers ────────────────────────────────────────────────────

function roughOffset(roughness: number) {
  return () => (Math.random() - 0.5) * roughness * 3;
}

function RoughRect({ el }: { el: CanvasElement }) {
  const { x, y, width: w, height: h, strokeColor, fillColor, strokeWidth, roughness, opacity } = el;
  const r = roughOffset(roughness);
  const path = `M ${x + r()} ${y + r()} L ${x + w + r()} ${y + r()} L ${x + w + r()} ${y + h + r()} L ${x + r()} ${y + h + r()} Z`;
  return (
    <path
      d={path}
      fill={fillColor === "transparent" ? "none" : fillColor}
      fillOpacity={fillColor === "transparent" ? 0 : opacity / 100}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
      style={{ filter: roughness > 0 ? "url(#roughen)" : undefined }}
    />
  );
}

function RoughEllipse({ el }: { el: CanvasElement }) {
  const { x, y, width: w, height: h, strokeColor, fillColor, strokeWidth, opacity } = el;
  const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2;
  return (
    <ellipse
      cx={cx} cy={cy} rx={rx} ry={ry}
      fill={fillColor === "transparent" ? "none" : fillColor}
      fillOpacity={fillColor === "transparent" ? 0 : opacity / 100}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
  );
}

function RoughDiamond({ el }: { el: CanvasElement }) {
  const { x, y, width: w, height: h, strokeColor, fillColor, strokeWidth, opacity } = el;
  const cx = x + w / 2, cy = y + h / 2;
  const path = `M ${cx} ${y} L ${x + w} ${cy} L ${cx} ${y + h} L ${x} ${cy} Z`;
  return (
    <path
      d={path}
      fill={fillColor === "transparent" ? "none" : fillColor}
      fillOpacity={fillColor === "transparent" ? 0 : opacity / 100}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  );
}

function RoughLine({ el }: { el: CanvasElement }) {
  const { x, y, width: w, height: h, strokeColor, strokeWidth } = el;
  return (
    <line x1={x} y1={y} x2={x + w} y2={y + h}
      stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
  );
}

function RoughArrow({ el }: { el: CanvasElement }) {
  const { x, y, width: w, height: h, strokeColor, strokeWidth } = el;
  const x2 = x + w, y2 = y + h;
  const angle = Math.atan2(y2 - y, x2 - x);
  const hs = Math.max(10, strokeWidth * 4);
  const a1x = x2 - hs * Math.cos(angle - 0.4);
  const a1y = y2 - hs * Math.sin(angle - 0.4);
  const a2x = x2 - hs * Math.cos(angle + 0.4);
  const a2y = y2 - hs * Math.sin(angle + 0.4);
  return (
    <g>
      <line x1={x} y1={y} x2={x2} y2={y2} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      <polyline points={`${a1x},${a1y} ${x2},${y2} ${a2x},${a2y}`}
        fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
}

function RoughPencil({ el }: { el: CanvasElement }) {
  const pts = el.points ?? [];
  if (pts.length < 2) return null;
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return (
    <path d={d} fill="none" stroke={el.strokeColor} strokeWidth={el.strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" />
  );
}

function RoughText({ el, isEditing, onEdit }: { el: CanvasElement; isEditing: boolean; onEdit: (id: string) => void }) {
  const textRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      const r = document.createRange();
      r.selectNodeContents(textRef.current);
      r.collapse(false);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(r);
    }
  }, [isEditing]);

  return (
    <foreignObject x={el.x} y={el.y} width={Math.max(el.width, 100)} height={Math.max(el.height, 40)}>
      <div
        ref={textRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onDoubleClick={() => onEdit(el.id)}
        className={cn(
          "outline-none w-full h-full p-1 break-words",
          isEditing ? "cursor-text" : "cursor-move select-none"
        )}
        style={{
          color: el.strokeColor,
          fontSize: el.fontSize ?? 18,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          minWidth: 60,
          minHeight: 30,
          whiteSpace: "pre-wrap",
        }}
      >
        {el.text ?? "Text"}
      </div>
    </foreignObject>
  );
}

function ElementRenderer({ el, isSelected, isEditing, onEdit }:
  { el: CanvasElement; isSelected: boolean; isEditing: boolean; onEdit: (id: string) => void; }) {
  const handles = isSelected ? resizeHandles(el) : [];

  return (
    <g style={{ opacity: el.opacity / 100 }}>
      {el.type === "rect"    && <RoughRect el={el} />}
      {el.type === "ellipse" && <RoughEllipse el={el} />}
      {el.type === "diamond" && <RoughDiamond el={el} />}
      {el.type === "line"    && <RoughLine el={el} />}
      {el.type === "arrow"   && <RoughArrow el={el} />}
      {el.type === "pencil"  && <RoughPencil el={el} />}
      {el.type === "text"    && <RoughText el={el} isEditing={isEditing} onEdit={onEdit} />}

      {/* Selection outline */}
      {isSelected && el.type !== "pencil" && el.type !== "text" && el.type !== "line" && el.type !== "arrow" && (
        <rect
          x={el.x - 4} y={el.y - 4}
          width={el.width + 8} height={el.height + 8}
          fill="none" stroke="#6366f1" strokeWidth={1.5}
          strokeDasharray="5,3" rx={4}
        />
      )}
      {isSelected && (el.type === "line" || el.type === "arrow") && (
        <line x1={el.x} y1={el.y} x2={el.x + el.width} y2={el.y + el.height}
          stroke="#6366f1" strokeWidth={3} strokeLinecap="round" opacity={0.35} />
      )}

      {/* Resize handles */}
      {handles.map(h => (
        <rect key={h.id} x={h.cx - 5} y={h.cy - 5} width={10} height={10}
          rx={2} fill="white" stroke="#6366f1" strokeWidth={1.5}
          className="cursor-nwse-resize"
          data-handle={h.id}
        />
      ))}
    </g>
  );
}

// ─── Toolbar button ───────────────────────────────────────────────────────────

function ToolBtn({ active, icon, label, shortcut, onClick }: {
  active: boolean; icon: React.ReactNode; label: string; shortcut?: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={`${label}${shortcut ? ` (${shortcut})` : ""}`}
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150",
        active
          ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105"
          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200"
      )}
    >
      {icon}
    </button>
  );
}

// ─── Color Swatch ─────────────────────────────────────────────────────────────

const STROKE_COLORS = ["#1e293b", "#ef4444", "#f97316", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];
const FILL_COLORS   = ["transparent", "#fef2f2", "#fff7ed", "#f0fdf4", "#eff6ff", "#f5f3ff", "#fdf4ff"];
const STROKE_WIDTHS = [1, 2, 4, 6];

// ─── Main Whiteboard ──────────────────────────────────────────────────────────

export function Whiteboard() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [tool, setTool] = useState<Tool>("select");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });

  const [strokeColor, setStrokeColor] = useState("#1e293b");
  const [fillColor, setFillColor]     = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [roughness, setRoughness]     = useState(1);
  const [opacity, setOpacity]         = useState(100);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [showGrid, setShowGrid]       = useState(true);

  // History
  const [history, setHistory]         = useState<CanvasElement[][]>([[]]);
  const [histIdx, setHistIdx]         = useState(0);

  const pushHistory = (els: CanvasElement[]) => {
    setHistory(h => [...h.slice(0, histIdx + 1), els.map(e => ({ ...e }))]);
    setHistIdx(i => i + 1);
  };

  const undo = () => {
    if (histIdx === 0) return;
    setHistIdx(i => i - 1);
    setElements(history[histIdx - 1].map(e => ({ ...e })));
  };

  const redo = () => {
    if (histIdx >= history.length - 1) return;
    setHistIdx(i => i + 1);
    setElements(history[histIdx + 1].map(e => ({ ...e })));
  };

  // Draw state
  const drawing = useRef(false);
  const drawStart = useRef<Point>({ x: 0, y: 0 });
  const currentEl = useRef<CanvasElement | null>(null);

  // Pan state
  const panning = useRef(false);
  const panStart = useRef<Point>({ x: 0, y: 0 });
  const panBase = useRef<Point>({ x: 0, y: 0 });

  // Select drag state
  const selDrag = useRef(false);
  const selDragStart = useRef<Point>({ x: 0, y: 0 });
  const selDragOffsets = useRef<Record<string, Point>>({});
  const [selBox, setSelBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const selBoxStart = useRef<Point>({ x: 0, y: 0 });
  const selBoxing = useRef(false);

  // Handle drag for selected element
  const [resizingHandle, setResizingHandle] = useState<string | null>(null);
  const resizeStart = useRef<{ el: CanvasElement; mx: number; my: number } | null>(null);

  // ── Convert screen coords → SVG/world coords ───
  const toWorld = useCallback((clientX: number, clientY: number): Point => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const sx = (clientX - rect.left) / zoom - pan.x;
    const sy = (clientY - rect.top)  / zoom - pan.y;
    return snapEnabled ? { x: snap(sx), y: snap(sy) } : { x: sx, y: sy };
  }, [zoom, pan, snapEnabled]);

  // ── Keyboard shortcuts ─────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") { e.preventDefault(); redo(); return; }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length && !editingId) {
          const next = elements.filter(el => !selectedIds.includes(el.id));
          setElements(next); pushHistory(next); setSelectedIds([]);
        }
        return;
      }
      if (e.key === "Escape") { setSelectedIds([]); setEditingId(null); setTool("select"); }
      const map: Record<string, Tool> = { v: "select", h: "hand", p: "pencil", r: "rect", e: "ellipse", d: "diamond", a: "arrow", l: "line", t: "text", x: "eraser" };
      if (map[e.key.toLowerCase()]) setTool(map[e.key.toLowerCase()]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIds, elements, editingId, histIdx, history]);

  // ── Wheel zoom ────────────────────────────────
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const factor = e.deltaY < 0 ? 1.08 : 0.93;
        setZoom(z => Math.max(0.1, Math.min(5, z * factor)));
      } else {
        setPan(p => ({ x: p.x - e.deltaX / zoom, y: p.y - e.deltaY / zoom }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoom]);

  // ── Mouse Down ────────────────────────────────
  const onMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 1 || (e.button === 0 && (e.altKey || e.metaKey) && tool !== "select")) {
      // Middle-click or alt → pan
      panning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      panBase.current = { ...pan };
      return;
    }

    const wp = toWorld(e.clientX, e.clientY);

    if (tool === "hand") {
      panning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      panBase.current = { ...pan };
      return;
    }

    if (tool === "select") {
      // Check resize handle first
      if (selectedIds.length === 1) {
        const sel = elements.find(el => el.id === selectedIds[0]);
        if (sel) {
          const handles = resizeHandles(sel);
          const target = e.target as SVGElement;
          const handleId = target.getAttribute?.("data-handle");
          if (handleId) {
            setResizingHandle(handleId);
            resizeStart.current = { el: { ...sel }, mx: wp.x, my: wp.y };
            return;
          }
        }
      }

      // Hit test
      const hit = [...elements].reverse().find(el => hitElement(wp.x, wp.y, el));
      if (hit) {
        if (!e.shiftKey) setSelectedIds([hit.id]);
        else setSelectedIds(ids => ids.includes(hit.id) ? ids.filter(i => i !== hit.id) : [...ids, hit.id]);
        // Prepare drag
        selDrag.current = true;
        selDragStart.current = wp;
        selDragOffsets.current = Object.fromEntries(
          elements.filter(el => selectedIds.includes(el.id) || el.id === hit.id)
            .map(el => [el.id, { x: el.x - wp.x, y: el.y - wp.y }])
        );
        return;
      }

      // Start selection box
      setSelectedIds([]);
      selBoxing.current = true;
      selBoxStart.current = wp;
      setSelBox({ x: wp.x, y: wp.y, w: 0, h: 0 });
      return;
    }

    if (tool === "eraser") {
      const hit = [...elements].reverse().find(el => hitElement(wp.x, wp.y, el));
      if (hit) {
        const next = elements.filter(el => el.id !== hit.id);
        setElements(next); pushHistory(next);
      }
      return;
    }

    if (tool === "text") {
      const existing = elements.find(el => el.type === "text" && ptInRect(wp.x, wp.y, el));
      if (existing) { setEditingId(existing.id); setSelectedIds([existing.id]); return; }
      const newEl: CanvasElement = {
        id: uid(), type: "text",
        x: wp.x, y: wp.y, width: 120, height: 40,
        strokeColor, fillColor: "transparent", strokeWidth,
        opacity, roughness, text: "Text", fontSize: 18,
      };
      const next = [...elements, newEl];
      setElements(next); pushHistory(next);
      setSelectedIds([newEl.id]);
      setEditingId(newEl.id);
      return;
    }

    // Drawing a shape
    drawing.current = true;
    drawStart.current = wp;
    const typeMap: Record<string, CanvasElement["type"]> = {
      rect: "rect", ellipse: "ellipse", diamond: "diamond",
      arrow: "arrow", line: "line", pencil: "pencil",
    };
    const elType = typeMap[tool] ?? "rect";
    const newEl: CanvasElement = {
      id: uid(), type: elType,
      x: wp.x, y: wp.y, width: 0, height: 0,
      strokeColor, fillColor, strokeWidth, opacity, roughness,
      points: elType === "pencil" ? [wp] : undefined,
    };
    currentEl.current = newEl;
    setElements(prev => [...prev, newEl]);
  };

  // ── Mouse Move ────────────────────────────────
  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const wp = toWorld(e.clientX, e.clientY);

    if (panning.current) {
      const dx = (e.clientX - panStart.current.x) / zoom;
      const dy = (e.clientY - panStart.current.y) / zoom;
      setPan({ x: panBase.current.x + dx, y: panBase.current.y + dy });
      return;
    }

    if (resizingHandle && resizeStart.current) {
      const { el: orig, mx, my } = resizeStart.current;
      const dx = wp.x - mx, dy = wp.y - my;
      const h = resizingHandle;
      const updated = { ...orig };
      if (h === "start") { updated.x = wp.x; updated.y = wp.y; }
      else if (h === "end") { updated.width = wp.x - orig.x; updated.height = wp.y - orig.y; }
      else {
        if (h.includes("e")) updated.width = orig.width + dx;
        if (h.includes("s")) updated.height = orig.height + dy;
        if (h.includes("w")) { updated.x = orig.x + dx; updated.width = orig.width - dx; }
        if (h.includes("n")) { updated.y = orig.y + dy; updated.height = orig.height - dy; }
      }
      setElements(els => els.map(el => el.id === orig.id ? updated : el));
      return;
    }

    if (selDrag.current && selectedIds.length) {
      setElements(els => els.map(el =>
        selectedIds.includes(el.id)
          ? { ...el, x: wp.x + (selDragOffsets.current[el.id]?.x ?? 0), y: wp.y + (selDragOffsets.current[el.id]?.y ?? 0) }
          : el
      ));
      return;
    }

    if (selBoxing.current) {
      const x = Math.min(wp.x, selBoxStart.current.x);
      const y = Math.min(wp.y, selBoxStart.current.y);
      const w = Math.abs(wp.x - selBoxStart.current.x);
      const h = Math.abs(wp.y - selBoxStart.current.y);
      setSelBox({ x, y, w, h });
      return;
    }

    if (!drawing.current || !currentEl.current) return;
    const el = currentEl.current;
    const dx = wp.x - drawStart.current.x;
    const dy = wp.y - drawStart.current.y;

    let updated: CanvasElement;
    if (el.type === "pencil") {
      updated = { ...el, points: [...(el.points ?? []), wp] };
    } else {
      const norm = normRect(drawStart.current.x, drawStart.current.y, dx, dy);
      updated = { ...el, ...norm };
    }

    currentEl.current = updated;
    setElements(prev => prev.map(e => e.id === el.id ? updated : e));
  };

  // ── Mouse Up ──────────────────────────────────
  const onMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (panning.current) { panning.current = false; return; }

    if (resizingHandle) {
      setResizingHandle(null);
      resizeStart.current = null;
      pushHistory([...elements]);
      return;
    }

    if (selDrag.current) {
      selDrag.current = false;
      pushHistory([...elements]);
      return;
    }

    if (selBoxing.current) {
      selBoxing.current = false;
      if (selBox) {
        const inside = elements.filter(el =>
          el.x >= selBox.x && el.x + el.width <= selBox.x + selBox.w &&
          el.y >= selBox.y && el.y + el.height <= selBox.y + selBox.h
        );
        setSelectedIds(inside.map(el => el.id));
      }
      setSelBox(null);
      return;
    }

    if (drawing.current && currentEl.current) {
      drawing.current = false;
      // discard tiny accidental elements
      const el = currentEl.current;
      const isDegenerate = el.type !== "pencil" &&
        el.type !== "text" &&
        Math.abs(el.width) < 4 && Math.abs(el.height) < 4;
      if (isDegenerate) {
        setElements(prev => prev.filter(e => e.id !== el.id));
      } else {
        setSelectedIds([el.id]);
        pushHistory([...elements]);
      }
      currentEl.current = null;
    }
  };

  // ── Selected element properties ───────────────
  const selectedEl = selectedIds.length === 1 ? elements.find(e => e.id === selectedIds[0]) : null;

  const updateSelected = (patch: Partial<CanvasElement>) => {
    const next = elements.map(el =>
      selectedIds.includes(el.id) ? { ...el, ...patch } : el
    );
    setElements(next);
    pushHistory(next);
  };

  const deleteSelected = () => {
    const next = elements.filter(el => !selectedIds.includes(el.id));
    setElements(next); pushHistory(next); setSelectedIds([]);
  };

  const zoomTo = (factor: number) => setZoom(z => Math.max(0.1, Math.min(5, z * factor)));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // ── Area Select (→ AI) ────────────────────
  const [areaBox, setAreaBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [showAreaMenu, setShowAreaMenu] = useState(false);
  const areaStart = useRef<Point>({ x: 0, y: 0 });
  const areaDrawing = useRef(false);

  // ── Cursor ────────────────────────────────────
  const cursorMap: Record<Tool, string> = {
    select: "default", area: "crosshair", hand: panning.current ? "grabbing" : "grab",
    pencil: "crosshair", rect: "crosshair", ellipse: "crosshair",
    diamond: "crosshair", arrow: "crosshair", line: "crosshair",
    text: "text", eraser: "cell",
  };

  // ─────────────────────────────────────────────
  return (
    <div className="h-full w-full relative bg-[#f8fafc] dark:bg-[#0c0c0f] overflow-hidden select-none">

      {/* ── Single Unified Top Bar ── */}
      <div className="absolute top-3 left-3 right-3 z-50 flex items-center gap-2 px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl">

        {/* Left zone: undo/redo + zoom + grid/snap */}
        <div className="flex items-center gap-0.5">
          <button onClick={undo} disabled={histIdx === 0}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-all text-zinc-500">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button onClick={redo} disabled={histIdx >= history.length - 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-all text-zinc-500">
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-0.5" />

        <div className="flex items-center gap-0.5">
          <button onClick={() => zoomTo(0.8)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button onClick={resetView} className="text-[10px] font-bold w-10 text-center hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg h-9 tabular-nums text-zinc-500">
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={() => zoomTo(1.25)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-0.5" />

        <button onClick={() => setShowGrid(g => !g)}
          className={cn("w-9 h-9 flex items-center justify-center rounded-xl transition-all",
            showGrid ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
          )}>
          <Grid className="h-4 w-4" />
        </button>

        <button onClick={() => setSnapEnabled(s => !s)}
          className={cn("px-2.5 h-9 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all",
            snapEnabled ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
          )}>
          Snap
        </button>

        {/* Center zone separator */}
        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-0.5" />

        {/* Center zone: all drawing tools */}
        <div className="flex items-center gap-0.5 flex-1 justify-center">
          {([
            ["select",  <MousePointer2 className="h-4 w-4" />, "Select (V)"],
            ["hand",    <Hand className="h-4 w-4" />,           "Pan (H)"],
            ["area",    <Crop className="h-4 w-4" />,           "Select Area → AI"],
            ["──", null, ""],
            ["pencil",  <Pencil className="h-4 w-4" />,         "Draw (P)"],
            ["rect",    <Square className="h-4 w-4" />,          "Rectangle (R)"],
            ["ellipse", <Circle className="h-4 w-4" />,          "Ellipse (E)"],
            ["diamond", <Diamond className="h-4 w-4" />,         "Diamond (D)"],
            ["arrow",   <ArrowRight className="h-4 w-4" />,      "Arrow"],
            ["line",    <Minus className="h-4 w-4" />,           "Line (L)"],
            ["text",    <Type className="h-4 w-4" />,            "Text (T)"],
            ["──", null, ""],
            ["eraser",  <Eraser className="h-4 w-4" />,          "Eraser (X)"],
          ] as [string, React.ReactNode, string][]).map(([id, icon, label], i) => (
            id === "──"
              ? <div key={i} className="w-px h-6 bg-zinc-100 dark:bg-zinc-800 mx-0.5" />
              : (
                <button
                  key={id}
                  title={label as string}
                  onClick={() => setTool(id as Tool)}
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150",
                    tool === id
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200"
                  )}
                >
                  {icon}
                </button>
              )
          ))}
        </div>
      </div>

      {/* ── Right Properties Panel ── */}
      <div className="absolute right-3 top-[60px] z-50 flex flex-col gap-3 p-3 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl text-[11px]">
        <p className="font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 text-[9px]">Properties</p>

        {/* Stroke Color */}
        <div>
          <p className="font-semibold text-zinc-500 mb-1.5">Stroke</p>
          <div className="flex flex-wrap gap-1.5">
            {STROKE_COLORS.map(c => (
              <button key={c} className={cn("w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                (selectedEl?.strokeColor ?? strokeColor) === c ? "border-teal-500 scale-110" : "border-transparent"
              )} style={{ backgroundColor: c }}
                onClick={() => { setStrokeColor(c); if (selectedEl) updateSelected({ strokeColor: c }); }}
              />
            ))}
          </div>
        </div>

        {/* Fill Color */}
        <div>
          <p className="font-semibold text-zinc-500 mb-1.5">Fill</p>
          <div className="flex flex-wrap gap-1.5">
            {FILL_COLORS.map(c => (
              <button key={c} className={cn("w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                (selectedEl?.fillColor ?? fillColor) === c ? "border-teal-500 scale-110" : "border-zinc-200 dark:border-zinc-700"
              )} style={{ backgroundColor: c === "transparent" ? "white" : c }}
                onClick={() => { setFillColor(c); if (selectedEl) updateSelected({ fillColor: c }); }}
              >
                {c === "transparent" && <span className="block w-full h-full flex items-center justify-center text-zinc-400 text-[8px] font-bold">∅</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Stroke Width */}
        <div>
          <p className="font-semibold text-zinc-500 mb-1.5">Width</p>
          <div className="flex gap-1.5 items-center">
            {STROKE_WIDTHS.map(w => (
              <button key={w} className={cn("flex-1 flex items-center justify-center h-7 rounded-lg border transition-all",
                (selectedEl?.strokeWidth ?? strokeWidth) === w
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-600"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
              )} onClick={() => { setStrokeWidth(w); if (selectedEl) updateSelected({ strokeWidth: w }); }}>
                <div className="rounded-full bg-current" style={{ width: w * 2, height: w * 2 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Roughness */}
        <div>
          <p className="font-semibold text-zinc-500 mb-1.5">Style</p>
          <div className="flex gap-1.5">
            {[{ v: 0, label: "Sharp" }, { v: 1.5, label: "Rough" }].map(s => (
              <button key={s.v} className={cn("flex-1 py-1 rounded-lg border text-[10px] font-bold transition-all",
                (selectedEl?.roughness ?? roughness) === s.v
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-600"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300"
              )} onClick={() => { setRoughness(s.v); if (selectedEl) updateSelected({ roughness: s.v }); }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Opacity */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="font-semibold text-zinc-500">Opacity</p>
            <span className="text-zinc-400 font-bold">{selectedEl?.opacity ?? opacity}%</span>
          </div>
          <input type="range" min={10} max={100} step={5}
            value={selectedEl?.opacity ?? opacity}
            onChange={e => { const v = Number(e.target.value); setOpacity(v); if (selectedEl) updateSelected({ opacity: v }); }}
            className="w-full accent-teal-600"
          />
        </div>

        {/* Delete */}
        {selectedIds.length > 0 && (
          <button onClick={deleteSelected}
            className="w-full py-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 font-bold text-[10px] uppercase tracking-wider hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center justify-center gap-1.5">
            <Trash2 className="h-3 w-3" />
            Delete {selectedIds.length > 1 ? `(${selectedIds.length})` : ""}
          </button>
        )}
      </div>

      {/* ── SVG Canvas ── */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ cursor: cursorMap[tool] }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <defs>
          {/* subtle paper grain */}
          <filter id="roughen">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feDisplacementMap in="SourceGraphic" scale="2" />
          </filter>
        </defs>

        {/* Grid */}
        {showGrid && (
          <g opacity="0.35">
            <defs>
              <pattern id="grid" width={GRID * zoom} height={GRID * zoom} patternUnits="userSpaceOnUse"
                x={(pan.x * zoom) % (GRID * zoom)} y={(pan.y * zoom) % (GRID * zoom)}>
                <path d={`M ${GRID * zoom} 0 L 0 0 0 ${GRID * zoom}`} fill="none"
                  stroke="#c7d2fe" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </g>
        )}

        {/* World-space group */}
        <g transform={`translate(${pan.x * zoom}, ${pan.y * zoom}) scale(${zoom})`}>
          {elements.map(el => (
            <ElementRenderer
              key={el.id}
              el={el}
              isSelected={selectedIds.includes(el.id)}
              isEditing={editingId === el.id}
              onEdit={id => setEditingId(id)}
            />
          ))}

          {/* Selection box rubber-band */}
          {selBox && (
            <rect x={selBox.x} y={selBox.y} width={selBox.w} height={selBox.h}
              fill="#0d948820" stroke="#0d9488" strokeWidth={1} strokeDasharray="4,3" />
          )}
        </g>
      </svg>

      {/* ── Area → AI popup ── */}
      {showAreaMenu && areaBox && (
        <div
          className="fixed z-[200] flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95"
          style={{ top: (areaBox.y + pan.y) * zoom + 16, left: (areaBox.x + pan.x) * zoom + areaBox.w * zoom / 2, transform: 'translateX(-50%)' }}
        >
          <span className="text-[10px] font-black text-white/50 uppercase tracking-wider">Send to AI</span>
          <div className="w-px h-4 bg-white/10" />
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-black uppercase tracking-wider transition-colors"
            onClick={() => setShowAreaMenu(false)}
          >
            <Sparkles className="h-3 w-3" /> Ask AI
          </button>
          <button
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/50 transition-colors"
            onClick={() => { setShowAreaMenu(false); setAreaBox(null); }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
