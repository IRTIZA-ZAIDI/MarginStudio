import { create } from 'zustand';

export type ToolMode = 'select' | 'highlight' | 'area' | 'text' | 'sticky' | 'pen' | 'eraser';

export interface PDFCoordinates {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Selection {
  type: 'text' | 'area';
  content: string; // Text content or image placeholder
  imageUrl?: string;
  pageNumber: number;
  coordinates: PDFCoordinates; // Normalized 0-1
}

export interface Annotation {
  id: string;
  type: ToolMode;
  pageNumber: number;
  coordinates: PDFCoordinates;
  content?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  fontFamily?: string;
  textDecoration?: string;
  backgroundColor?: string;
  rects?: PDFCoordinates[]; // For multi-line highlights/selections
  path?: PDFCoordinates[]; // Array of points for drawing
  createdAt: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  relatedSelection?: Selection;
}

export interface Version {
  id: string;
  name: string;
  timestamp: number;
  annotations: Annotation[];
}

export type AIModel = 'claude-3-5-sonnet' | 'claude-3-opus' | 'gpt-4o' | 'gemini-1-5-pro';

export interface GeneratedAsset {
  id: string;
  title: string;
  type: 'flashcards' | 'summary' | 'pointers' | 'slidedeck' | 'podcast' | 'diagram';
  content: string;
  timestamp: number;
}

interface AppState {
  // File State
  fileUrl: string | null;
  setFileUrl: (url: string | null) => void;

  // Viewer State
  scale: number;
  currentPage: number;
  toolMode: ToolMode;
  isSidebarOpen: boolean;

  // Selection & Annotations
  currentSelection: Selection | null;
  annotations: Annotation[];
  
  // Generated Assets (NotebookLM Style)
  assets: GeneratedAsset[];
  addAsset: (asset: GeneratedAsset) => void;
  isGenerating: boolean;
  setIsGenerating: (is: boolean) => void;

  // History (Undo/Redo)
  history: Annotation[][];
  future: Annotation[][];
  saveToHistory: (stateOverride?: Annotation[]) => void;
  undo: () => void;
  redo: () => void;

  // Versions
  versionHistory: Version[];
  saveVersion: (name: string) => void;
  restoreVersion: (id: string) => void;

  // Model Selection
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;

  // Color selection
  strokeColor: string;
  setStrokeColor: (color: string) => void;

  // Chat
  chatHistory: Message[];
  isLoading: boolean;

  // Actions
  setScale: (scale: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setCurrentPage: (page: number) => void;
  setToolMode: (mode: ToolMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setCurrentSelection: (selection: Selection | null) => void;
  addAnnotation: (annotation: Annotation) => void;
  removeAnnotation: (id: string) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>, final?: boolean) => void;
  addMessage: (message: Message) => void;
  sendMessage: (content: string, selection?: Selection | null, assetType?: GeneratedAsset['type']) => Promise<void>;
}

export const useAppState = create<AppState>((set, get) => ({
  // Initial State
  fileUrl: null,
  scale: 1,
  currentPage: 1,
  toolMode: 'select',
  isSidebarOpen: true,
  currentSelection: null,
  annotations: [],
  assets: [],
  isGenerating: false,
  history: [],
  future: [],
  versionHistory: [],
  selectedModel: 'claude-3-5-sonnet',
  strokeColor: '#2d7a5f', // Anthropic Green
  chatHistory: [],
  isLoading: false,

  // Actions
  setFileUrl: (fileUrl) => set({ fileUrl }),
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setScale: (scale) => set({ scale }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  addAsset: (asset) => set((state) => ({ assets: [asset, ...state.assets] })),
  zoomIn: () => set((state) => ({ scale: Math.min(state.scale + 0.1, 3) })),
  zoomOut: () => set((state) => ({ scale: Math.max(state.scale - 0.1, 0.5) })),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setToolMode: (toolMode) => set({ toolMode }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setCurrentSelection: (currentSelection) => set({ currentSelection }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),

  saveToHistory: (stateOverride) => {
    const { annotations, history } = get();
    const toSave = stateOverride ? stateOverride : annotations;
    set({
      history: [...history, JSON.parse(JSON.stringify(toSave))].slice(-30),
      future: []
    });
  },

  undo: () => {
    const { history, annotations, future } = get();
    if (history.length === 0) return;
    
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    
    set({
      annotations: previous,
      history: newHistory,
      future: [JSON.parse(JSON.stringify(annotations)), ...future]
    });
  },

  redo: () => {
    const { future, annotations, history } = get();
    if (future.length === 0) return;
    
    const next = future[0];
    const newFuture = future.slice(1);
    
    set({
      annotations: next,
      history: [...history, JSON.parse(JSON.stringify(annotations))],
      future: newFuture
    });
  },

  saveVersion: (name) => {
    const { annotations, versionHistory } = get();
    const newVersion: Version = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      timestamp: Date.now(),
      annotations: JSON.parse(JSON.stringify(annotations))
    };
    set({ versionHistory: [newVersion, ...versionHistory] });
  },

  restoreVersion: (id) => {
    const { versionHistory } = get();
    const version = versionHistory.find(v => v.id === id);
    if (version) {
      get().saveToHistory();
      set({ annotations: JSON.parse(JSON.stringify(version.annotations)) });
    }
  },

  addAnnotation: (annotation) => {
    get().saveToHistory();
    set((state) => ({ annotations: [...state.annotations, annotation] }));
  },

  removeAnnotation: (id) => {
    get().saveToHistory();
    set((state) => ({ annotations: state.annotations.filter((a) => a.id !== id) }));
  },

  updateAnnotation: (id, updates, final = true) => {
    if (final) get().saveToHistory();
    set((state) => ({
      annotations: state.annotations.map((a) => a.id === id ? { ...a, ...updates } : a)
    }));
  },

  addMessage: (message: Message) => set((state) => ({ chatHistory: [...state.chatHistory, message] })),
  
  sendMessage: async (content, selection, assetType) => {
    const { v4: uuidv4 } = await import('uuid');
    const { selectedModel } = get();
    
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
      relatedSelection: selection || undefined
    };

    set((state) => ({ 
        chatHistory: [...state.chatHistory, userMessage],
        isLoading: !assetType,
        isGenerating: !!assetType,
        isSidebarOpen: true
    }));

    // Simulation delay
    setTimeout(async () => {
        if (assetType) {
            const newAsset: GeneratedAsset = {
                id: uuidv4(),
                title: `${assetType.toUpperCase()} - ${new Date().toLocaleTimeString()}`,
                type: assetType,
                content: `Generated ${assetType} content for: ${selection?.content || 'Selection'}\n\n1. Key insight here\n2. Supporting evidence\n3. Final conclusion.`,
                timestamp: Date.now()
            };
            set(state => ({ 
                assets: [newAsset, ...state.assets],
                isGenerating: false,
                isLoading: false
            }));
        } else {
            const aiMessage: Message = {
                id: uuidv4(),
                role: 'assistant',
                content: `[Model: ${selectedModel}]\n\nI've analyzed the ${selection?.type === 'area' ? 'selected area' : 'selected text'}. \n\nHow else can I help with this section?`,
                timestamp: Date.now()
            };
            set((state) => ({ 
                chatHistory: [...state.chatHistory, aiMessage],
                isLoading: false
            }));
        }
    }, 2000);
  }
}));
