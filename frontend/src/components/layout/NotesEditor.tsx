"use client";

import { useAppState } from "@/store/useAppState";
import { cn } from "@/lib/utils";
import {
  Bold, Italic, List, ListOrdered, Quote, Sparkles, Save,
  Underline, Strikethrough, Code, Link, AlignLeft, AlignCenter,
  Hash, Type, StickyNote, ChevronRight, Plus, SquareCheckBig,
  Minus, ImageIcon, Table, AlertTriangle, Lightbulb, Info, CheckCircle
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SlashItem {
  icon: React.ReactNode;
  label: string;
  desc: string;
  action: (editor: HTMLDivElement) => void;
}

// ─── Slash Command Items ──────────────────────────────────────────────────────

function makeSlashItems(exec: (cmd: string, val?: string) => void): SlashItem[] {
  return [
    {
      icon: <span className="text-base font-black text-zinc-500">H1</span>,
      label: "Heading 1",
      desc: "Large section heading",
      action: (ed) => { cleanSlash(ed); exec("formatBlock", "H1"); }
    },
    {
      icon: <span className="text-sm font-black text-zinc-500">H2</span>,
      label: "Heading 2",
      desc: "Medium section heading",
      action: (ed) => { cleanSlash(ed); exec("formatBlock", "H2"); }
    },
    {
      icon: <span className="text-xs font-black text-zinc-500">H3</span>,
      label: "Heading 3",
      desc: "Small section heading",
      action: (ed) => { cleanSlash(ed); exec("formatBlock", "H3"); }
    },
    {
      icon: <List className="h-4 w-4 text-zinc-500" />,
      label: "Bullet List",
      desc: "Unordered list",
      action: (ed) => { cleanSlash(ed); exec("insertUnorderedList"); }
    },
    {
      icon: <ListOrdered className="h-4 w-4 text-zinc-500" />,
      label: "Numbered List",
      desc: "Ordered list",
      action: (ed) => { cleanSlash(ed); exec("insertOrderedList"); }
    },
    {
      icon: <SquareCheckBig className="h-4 w-4 text-zinc-500" />,
      label: "To-do",
      desc: "Track tasks with checkboxes",
      action: (ed) => {
        cleanSlash(ed);
        const html = `<div class="notion-todo flex items-start gap-2 my-1"><input type="checkbox" class="mt-1.5 accent-teal-600 w-4 h-4 shrink-0 cursor-pointer"/><span contenteditable="true" class="outline-none flex-1">To-do item</span></div>`;
        exec("insertHTML", html);
      }
    },
    {
      icon: <Quote className="h-4 w-4 text-zinc-500" />,
      label: "Quote",
      desc: "Capture a quote",
      action: (ed) => { cleanSlash(ed); exec("formatBlock", "BLOCKQUOTE"); }
    },
    {
      icon: <Code className="h-4 w-4 text-zinc-500" />,
      label: "Code Block",
      desc: "Snippet of code",
      action: (ed) => {
        cleanSlash(ed);
        exec("insertHTML", `<pre class="notion-code"><code contenteditable="true">// Your code here</code></pre>`);
      }
    },
    {
      icon: <Info className="h-4 w-4 text-blue-500" />,
      label: "Callout (Info)",
      desc: "Callout with blue highlight",
      action: (ed) => {
        cleanSlash(ed);
        exec("insertHTML", `<div class="notion-callout notion-callout--info"><span class="notion-callout__icon">💡</span><div contenteditable="true" class="outline-none flex-1">Add context or a note here.</div></div>`);
      }
    },
    {
      icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      label: "Callout (Warning)",
      desc: "Callout with yellow highlight",
      action: (ed) => {
        cleanSlash(ed);
        exec("insertHTML", `<div class="notion-callout notion-callout--warn"><span class="notion-callout__icon">⚠️</span><div contenteditable="true" class="outline-none flex-1">Important warning to note.</div></div>`);
      }
    },
    {
      icon: <Minus className="h-4 w-4 text-zinc-500" />,
      label: "Divider",
      desc: "Visual separator",
      action: (ed) => {
        cleanSlash(ed);
        exec("insertHTML", `<hr class="notion-divider"/><p><br></p>`);
      }
    },
    {
      icon: <Type className="h-4 w-4 text-zinc-500" />,
      label: "Text",
      desc: "Plain paragraph",
      action: (ed) => { cleanSlash(ed); exec("formatBlock", "P"); }
    },
  ];
}

function cleanSlash(ed: HTMLDivElement) {
  // Remove the "/" that triggered the menu from the current selection
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  // Walk backwards one character
  try {
    const newRange = range.cloneRange();
    newRange.setStart(range.startContainer, Math.max(0, range.startOffset - 1));
    newRange.deleteContents();
  } catch (_) {}
}

// ─── Inline Bubble Toolbar ────────────────────────────────────────────────────

interface BubbleToolbarProps {
  visible: boolean;
  top: number;
  left: number;
  exec: (cmd: string, val?: string) => void;
  onClose: () => void;
}

const textColors = [
  { label: "Default",  val: "inherit",  bg: "bg-zinc-800 dark:bg-zinc-200" },
  { label: "Blue",     val: "#2563eb",  bg: "bg-blue-600" },
  { label: "Red",      val: "#dc2626",  bg: "bg-red-600" },
  { label: "Green",    val: "#16a34a",  bg: "bg-green-600" },
  { label: "Purple",   val: "#9333ea",  bg: "bg-purple-600" },
  { label: "Orange",   val: "#ea580c",  bg: "bg-orange-600" },
];

const highlightColors = [
  { label: "None",    val: "transparent", bg: "bg-white border border-zinc-300" },
  { label: "Yellow",  val: "#fef08a",     bg: "bg-yellow-200" },
  { label: "Green",   val: "#bbf7d0",     bg: "bg-green-200" },
  { label: "Blue",    val: "#bfdbfe",     bg: "bg-blue-200" },
  { label: "Pink",    val: "#fbcfe8",     bg: "bg-pink-200" },
  { label: "Purple",  val: "#e9d5ff",     bg: "bg-purple-200" },
];

function BubbleToolbar({ visible, top, left, exec, onClose }: BubbleToolbarProps) {
  if (!visible) return null;
  return (
    <div
      className="fixed z-[200] flex items-center gap-0.5 px-1.5 py-1 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      style={{ top, left, transform: "translateX(-50%)" }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Format */}
      <BubbleBtn icon={<Bold className="h-3.5 w-3.5" />} title="Bold" onClick={() => exec("bold")} />
      <BubbleBtn icon={<Italic className="h-3.5 w-3.5" />} title="Italic" onClick={() => exec("italic")} />
      <BubbleBtn icon={<Underline className="h-3.5 w-3.5" />} title="Underline" onClick={() => exec("underline")} />
      <BubbleBtn icon={<Strikethrough className="h-3.5 w-3.5" />} title="Strikethrough" onClick={() => exec("strikeThrough")} />
      <BubbleBtn icon={<Code className="h-3.5 w-3.5" />} title="Inline Code" onClick={() => exec("insertHTML", `<code class="notion-inline-code">${window.getSelection()?.toString()}</code>`)} />

      <div className="w-px h-4 bg-white/10 mx-1" />

      {/* Headings */}
      <BubbleBtn icon={<span className="text-[10px] font-black">H1</span>} title="H1" onClick={() => exec("formatBlock", "H1")} />
      <BubbleBtn icon={<span className="text-[10px] font-black">H2</span>} title="H2" onClick={() => exec("formatBlock", "H2")} />
      <BubbleBtn icon={<span className="text-[10px] font-black">H3</span>} title="H3" onClick={() => exec("formatBlock", "H3")} />

      <div className="w-px h-4 bg-white/10 mx-1" />

      {/* Lists */}
      <BubbleBtn icon={<List className="h-3.5 w-3.5" />} title="Bullet List" onClick={() => exec("insertUnorderedList")} />
      <BubbleBtn icon={<ListOrdered className="h-3.5 w-3.5" />} title="Numbered List" onClick={() => exec("insertOrderedList")} />
      <BubbleBtn icon={<Quote className="h-3.5 w-3.5" />} title="Quote" onClick={() => exec("formatBlock", "BLOCKQUOTE")} />

      <div className="w-px h-4 bg-white/10 mx-1" />

      {/* Text Colors */}
      <div className="flex items-center gap-1 px-1">
        {textColors.map(c => (
          <button
            key={c.val}
            className={cn("w-3 h-3 rounded-full transition-transform hover:scale-125", c.bg)}
            title={`Text: ${c.label}`}
            onMouseDown={(e) => { e.preventDefault(); exec("foreColor", c.val === "inherit" ? "#000000" : c.val); }}
          />
        ))}
      </div>

      <div className="w-px h-4 bg-white/10 mx-1" />

      {/* Highlight */}
      <div className="flex items-center gap-1 px-1">
        {highlightColors.map(c => (
          <button
            key={c.val}
            className={cn("w-3 h-3 rounded-full transition-transform hover:scale-125", c.bg)}
            title={`Highlight: ${c.label}`}
            onMouseDown={(e) => { e.preventDefault(); exec("hiliteColor", c.val); }}
          />
        ))}
      </div>

      <div className="w-px h-4 bg-white/10 mx-1" />

      <button
        className="h-7 px-2 text-[9px] font-black uppercase text-teal-400 hover:bg-white/10 rounded-lg flex items-center gap-1.5 transition-colors"
        onMouseDown={(e) => { e.preventDefault(); }}
      >
        <Sparkles className="h-3.5 w-3.5" />
        AI
      </button>
    </div>
  );
}

function BubbleBtn({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      className="h-7 w-7 flex items-center justify-center rounded-lg text-white hover:bg-white/15 transition-colors"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    >
      {icon}
    </button>
  );
}

// ─── Slash command menu ───────────────────────────────────────────────────────

interface SlashMenuProps {
  visible: boolean;
  top: number;
  left: number;
  filter: string;
  items: SlashItem[];
  onSelect: (item: SlashItem) => void;
}

function SlashMenu({ visible, top, left, filter, items, onSelect }: SlashMenuProps) {
  const [active, setActive] = useState(0);
  const filtered = items.filter(i =>
    i.label.toLowerCase().includes(filter.toLowerCase()) ||
    i.desc.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => setActive(0), [filter]);

  if (!visible || filtered.length === 0) return null;

  return (
    <div
      className="fixed z-[300] w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
      style={{ top: top + 8, left }}
    >
      <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Basic Blocks</p>
      </div>
      <div className="max-h-72 overflow-y-auto p-1">
        {filtered.map((item, i) => (
          <button
            key={item.label}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
              i === active
                ? "bg-zinc-100 dark:bg-zinc-800"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            )}
            onMouseDown={(e) => { e.preventDefault(); onSelect(item); }}
            onMouseEnter={() => setActive(i)}
          >
            <div className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{item.label}</p>
              <p className="text-[11px] text-zinc-400">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────

export function NotesEditor() {
  const { workspaces, activeWorkspaceId, updateWorkspaceNotes } = useAppState();
  const activeWS = workspaces.find(w => w.id === activeWorkspaceId);

  const editorRef = useRef<HTMLDivElement>(null);
  const lastWSId = useRef<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);

  // Bubble toolbar
  const [bubble, setBubble] = useState({ visible: false, top: 0, left: 0 });

  // Slash menu
  const [slashMenu, setSlashMenu] = useState({ visible: false, top: 0, left: 0, filter: "" });
  const slashRange = useRef<Range | null>(null);

  // ── Load content on workspace switch (avoid re-rendering during typing) ──
  useEffect(() => {
    if (!activeWS || activeWorkspaceId === lastWSId.current) return;
    lastWSId.current = activeWorkspaceId;
    if (editorRef.current) {
      editorRef.current.innerHTML = activeWS.notes || "";
    }
  }, [activeWorkspaceId, activeWS]);

  // ── Auto-save every 8s when editor is focused ──
  useEffect(() => {
    const id = setInterval(() => {
      if (!activeWorkspaceId || !editorRef.current) return;
      if (!editorRef.current.contains(document.activeElement) && document.activeElement !== editorRef.current) return;
      const html = editorRef.current.innerHTML;
      if (html !== activeWS?.notes) {
        updateWorkspaceNotes(activeWorkspaceId, html);
      }
    }, 8000);
    return () => clearInterval(id);
  }, [activeWorkspaceId, activeWS?.notes]);

  const execCommand = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (!activeWorkspaceId || !editorRef.current) return;
    setIsSaving(true);
    setSavedRecently(true);
    updateWorkspaceNotes(activeWorkspaceId, editorRef.current.innerHTML);
    setTimeout(() => { setIsSaving(false); }, 800);
    setTimeout(() => setSavedRecently(false), 3000);
  };

  // ── Selection → Bubble Toolbar ──
  const handleSelectionChange = () => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && editorRef.current?.contains(sel.anchorNode)) {
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      // Position below the selection, clamped so it doesn't go off-screen top
      const prefBelow = rect.bottom + 10;
      const prefAbove = rect.top - 52;
      // Use below if there's viewport room, else above
      const top = prefBelow + 52 < window.innerHeight ? prefBelow : prefAbove;
      const left = Math.max(160, Math.min(window.innerWidth - 160, rect.left + rect.width / 2));
      setBubble({ visible: true, top, left });
    } else {
      setBubble(b => ({ ...b, visible: false }));
    }
  };

  // ── Keydown: slash, escape ──
  const slashItems = makeSlashItems(execCommand);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "/" && !slashMenu.visible) {
      // Open slash menu at cursor
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        slashRange.current = sel.getRangeAt(0).cloneRange();
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        setSlashMenu({ visible: true, top: rect.bottom, left: rect.left, filter: "" });
      }
      return;
    }

    if (slashMenu.visible) {
      if (e.key === "Escape") { setSlashMenu(m => ({ ...m, visible: false })); return; }
      if (e.key === "Backspace" && slashMenu.filter === "") {
        setSlashMenu(m => ({ ...m, visible: false })); return;
      }
      if (e.key === "Backspace") {
        setSlashMenu(m => ({ ...m, filter: m.filter.slice(0, -1) }));
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setSlashMenu(m => ({ ...m, filter: m.filter + e.key }));
        return;
      }
    }

    // Tab → indent
    if (e.key === "Tab") {
      e.preventDefault();
      execCommand("insertHTML", "&nbsp;&nbsp;&nbsp;&nbsp;");
    }

    // Keyboard shortcuts
    if ((e.metaKey || e.ctrlKey)) {
      if (e.key === "s") { e.preventDefault(); handleSave(); }
      if (e.key === "b") { e.preventDefault(); execCommand("bold"); }
      if (e.key === "i") { e.preventDefault(); execCommand("italic"); }
      if (e.key === "u") { e.preventDefault(); execCommand("underline"); }
    }
  };

  const handleInput = () => {
    // Update slash filter as user types after "/"
    // (Handled by keydown above)
  };

  const acceptSlash = (item: SlashItem) => {
    setSlashMenu(m => ({ ...m, visible: false }));
    if (editorRef.current) {
      editorRef.current.focus();
      item.action(editorRef.current);
    }
  };

  const titleRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="h-full w-full overflow-y-auto bg-white dark:bg-zinc-950"
      onClick={() => { setBubble(b => ({ ...b, visible: false })); setSlashMenu(m => ({ ...m, visible: false })); }}
    >
      {/* ── Page Cover / Header Area ──────────────────────────── */}
      <div className="relative group/header">
        {/* Cover strip */}
        <div className="h-32 w-full bg-gradient-to-br from-teal-500/20 via-violet-500/10 to-blue-500/20 dark:from-teal-900/30 dark:via-violet-900/20 dark:to-blue-900/30" />

        {/* Page icon */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-16 h-16 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-lg flex items-center justify-center text-3xl select-none cursor-default">
          📝
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 pb-40 pt-16">

        {/* Status row */}
        <div className="flex items-center justify-between mb-4 text-[11px] text-zinc-400 dark:text-zinc-600">
          <span className="font-medium uppercase tracking-widest">{activeWS?.name} · Research Notes</span>
          <div className="flex items-center gap-3">
            {isSaving && <span className="text-teal-500 animate-pulse font-semibold">Saving…</span>}
            {savedRecently && !isSaving && <span className="text-green-500 font-semibold flex items-center gap-1"><CheckCircle className="h-3 w-3" />Saved</span>}
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              Save
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Untitled"
          className={cn(
            "text-5xl font-black tracking-tight leading-tight outline-none mb-8",
            "text-zinc-900 dark:text-zinc-50",
            "empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-200 dark:empty:before:text-zinc-800"
          )}
        />

        {/* Helper hint */}
        <p className="text-xs text-zinc-300 dark:text-zinc-700 mb-6 select-none">
          Type <kbd className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono text-[10px]">/</kbd> for commands &nbsp;·&nbsp;
          Select text to format &nbsp;·&nbsp;
          <kbd className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono text-[10px]">⌘S</kbd> to save
        </p>

        {/* ── Editor ─────────────────────────────────────────── */}
        <div
          ref={editorRef}
          id="notion-editor"
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Start writing, or press '/' for commands…"
          spellCheck
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onMouseUp={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          onFocus={() => {
            if (editorRef.current && !editorRef.current.innerHTML) {
              // empty editor: start fresh
            }
          }}
          className={cn(
            "notion-editor outline-none min-h-[60vh] w-full",
            "text-zinc-800 dark:text-zinc-200",
            "leading-relaxed text-lg font-normal",
            "empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-300 dark:empty:before:text-zinc-700 empty:before:pointer-events-none"
          )}
          style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
        />
      </div>

      {/* ── Bubble (Inline) Toolbar ────────────────────────── */}
      <BubbleToolbar
        visible={bubble.visible}
        top={bubble.top}
        left={bubble.left}
        exec={execCommand}
        onClose={() => setBubble(b => ({ ...b, visible: false }))}
      />

      {/* ── Slash Menu ─────────────────────────────────────── */}
      <SlashMenu
        visible={slashMenu.visible}
        top={slashMenu.top}
        left={slashMenu.left}
        filter={slashMenu.filter}
        items={slashItems}
        onSelect={acceptSlash}
      />

      {/* ── Global Styles ──────────────────────────────────── */}
      <style>{`
        .notion-editor h1 {
          font-size: 2.25rem;
          font-weight: 800;
          line-height: 1.2;
          margin: 1.5rem 0 0.75rem;
          color: inherit;
        }
        .notion-editor h2 {
          font-size: 1.65rem;
          font-weight: 700;
          line-height: 1.3;
          margin: 1.25rem 0 0.6rem;
          color: inherit;
        }
        .notion-editor h3 {
          font-size: 1.25rem;
          font-weight: 700;
          line-height: 1.4;
          margin: 1rem 0 0.5rem;
          color: inherit;
        }
        .notion-editor p {
          margin: 0.25rem 0;
          min-height: 1.6em;
        }
        .notion-editor ul {
          list-style: disc;
          padding-left: 1.5rem;
          margin: 0.25rem 0;
        }
        .notion-editor ol {
          list-style: decimal;
          padding-left: 1.5rem;
          margin: 0.25rem 0;
        }
        .notion-editor li {
          margin: 0.15rem 0;
        }
        .notion-editor blockquote {
          border-left: 3px solid #0d9488;
          margin: 0.75rem 0;
          padding: 0.5rem 1rem;
          background: rgba(13,148,136,0.05);
          border-radius: 0 0.5rem 0.5rem 0;
          font-style: italic;
          color: #374151;
        }
        .dark .notion-editor blockquote {
          color: #d1d5db;
          background: rgba(13,148,136,0.08);
        }
        .notion-editor pre.notion-code {
          background: #1e293b;
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          margin: 0.75rem 0;
          overflow-x: auto;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 0.9rem;
          color: #e2e8f0;
          border: 1px solid #334155;
        }
        .notion-editor code.notion-inline-code {
          background: rgba(135,131,120,0.15);
          border-radius: 4px;
          padding: 0.1em 0.4em;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 0.875em;
          color: #c43f3f;
        }
        .notion-editor .notion-callout {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          border-radius: 0.75rem;
          padding: 0.875rem 1rem;
          margin: 0.75rem 0;
          border: 1px solid transparent;
        }
        .notion-editor .notion-callout--info {
          background: rgba(59,130,246,0.08);
          border-color: rgba(59,130,246,0.2);
        }
        .notion-editor .notion-callout--warn {
          background: rgba(234,179,8,0.08);
          border-color: rgba(234,179,8,0.25);
        }
        .notion-editor .notion-callout__icon {
          font-size: 1.1rem;
          line-height: 1.5;
          flex-shrink: 0;
        }
        .notion-editor hr.notion-divider {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 1.5rem 0;
        }
        .dark .notion-editor hr.notion-divider {
          border-top-color: #27272a;
        }
        .notion-editor .notion-todo {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin: 0.2rem 0;
        }
        .notion-editor::before {
          pointer-events: none;
          position: absolute;
        }
      `}</style>
    </div>
  );
}
