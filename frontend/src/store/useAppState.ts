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
  documentId: string; // New field
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

export interface Document {
  id: string;
  name: string;
  url: string;
}

export interface Workspace {
  id: string;
  name: string;
  documentIds: string[];
  notes?: string;
}

export interface GeneratedAsset {
  id: string;
  title: string;
  type: 'flashcards' | 'summary' | 'pointers' | 'slidedeck' | 'podcast' | 'diagram' | 'mcqs' | 'questions' | 'chat-pdf';
  content: string;
  timestamp: number;
  documentId?: string; // Which doc it was generated from
}

export interface WhiteboardElement {
  id: string;
  type: 'image' | 'text' | 'note' | 'shape' | 'arrow' | 'line' | 'diamond';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  imageUrl?: string;
  color?: string;
  rotation?: number;
  points?: { x: number; y: number }[];
}

export interface MagicOptions {
  tone: 'professional' | 'creative' | 'concise' | 'academic';
  creativity: number; // 0-1
  targetDocumentId?: string;
}

interface AppState {
  // Navigation & Workspace
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  setActiveWorkspace: (id: string | null) => void;
  updateWorkspaceName: (id: string, name: string) => void;
  updateWorkspaceNotes: (id: string, notes: string) => void;
  addWorkspace: (ws: Workspace) => void;
  
  isSignedIn: boolean;
  setSignedIn: (val: boolean) => void;
  
  // Documents
  documents: Document[];
  activeDocumentId: string | null;
  setActiveDocument: (id: string | null) => void;
  addDocument: (doc: Document) => void;

  // Viewer State
  scale: number;
  currentPage: number;
  toolMode: ToolMode;
  isSidebarOpen: boolean;
  isLibraryOpen: boolean;
  toggleLibrary: () => void;

  // Selection & Annotations
  currentSelection: Selection | null;
  annotations: Annotation[];
  
  // Generated Assets
  assets: GeneratedAsset[];
  addAsset: (asset: GeneratedAsset) => void;
  isGenerating: boolean;
  setIsGenerating: (is: boolean) => void;
  
  // Whiteboard
  whiteboardElements: WhiteboardElement[];
  addWhiteboardElement: (el: WhiteboardElement) => void;
  updateWhiteboardElement: (id: string, updates: Partial<WhiteboardElement>) => void;
  removeWhiteboardElement: (id: string) => void;

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

  // Model & Style Selection
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;

  // Chat
  chatHistory: Message[];
  isLoading: boolean;

  // Studio Tabs
  activeTab: string;
  setActiveTab: (tab: string) => void;
  numPages: number;
  setNumPages: (n: number) => void;

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
  sendMessage: (content: string, selection?: Selection | null, assetType?: GeneratedAsset['type'], options?: MagicOptions) => Promise<void>;
}

export const useAppState = create<AppState>((set, get) => ({
  // Initial State
  workspaces: [
    { id: 'ws_default', name: 'Default Research', documentIds: [], notes: "" },
    { id: 'ws_medical', name: 'Medical Analysis', documentIds: [], notes: "" },
    { id: 'ws_legal', name: 'Legal Case Review', documentIds: [], notes: "" },
  ],
  activeWorkspaceId: null, // Start at null for Dashboard
  isSignedIn: false,
  whiteboardElements: [],
  documents: [],
  activeDocumentId: null,
  scale: 1,
  currentPage: 1,
  toolMode: 'select',
  isSidebarOpen: true,
  isLibraryOpen: true,
  toggleLibrary: () => set((state) => ({ isLibraryOpen: !state.isLibraryOpen })),
  currentSelection: null,
  annotations: [],
  assets: [],
  isGenerating: false,
  history: [],
  future: [],
  versionHistory: [],
  selectedModel: 'claude-3-5-sonnet',
  strokeColor: '#0f766e', // Teal
  chatHistory: [],
  isLoading: false,
  activeTab: 'reader',
  numPages: 0,

  // Actions
  setActiveWorkspace: (activeWorkspaceId) => set({ activeWorkspaceId }),
  setSignedIn: (isSignedIn) => set({ isSignedIn }),
  updateWorkspaceName: (id, name) => set((state) => ({
    workspaces: state.workspaces.map(ws => ws.id === id ? { ...ws, name } : ws)
  })),
  updateWorkspaceNotes: (id, notes) => set((state) => ({
    workspaces: state.workspaces.map(ws => ws.id === id ? { ...ws, notes } : ws)
  })),
  addWorkspace: (ws) => set((state) => ({ workspaces: [...state.workspaces, ws] })),
  setActiveDocument: (activeDocumentId) => set({ activeDocumentId }),
  addDocument: (doc) => set((state) => {
    const updatedDocs = [...state.documents, doc];
    const updatedWorkspaces = state.workspaces.map(ws => 
      ws.id === state.activeWorkspaceId 
        ? { ...ws, documentIds: Array.from(new Set([...ws.documentIds, doc.id])) }
        : ws
    );
    return {
      documents: updatedDocs,
      workspaces: updatedWorkspaces,
      activeDocumentId: state.activeDocumentId || doc.id
    };
  }),
  setNumPages: (numPages) => set({ numPages }),
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setScale: (scale) => set({ scale }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setActiveTab: (activeTab) => set({ activeTab }),
  addAsset: (asset) => set((state) => ({ 
    assets: [asset, ...state.assets],
    activeTab: 'assets'
  })),
  zoomIn: () => set((state) => ({ scale: Math.min(state.scale + 0.1, 3) })),
  zoomOut: () => set((state) => ({ scale: Math.max(state.scale - 0.1, 0.5) })),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setToolMode: (toolMode) => set({ toolMode }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setCurrentSelection: (currentSelection) => set((state) => ({ 
      currentSelection, 
      isSidebarOpen: currentSelection ? true : state.isSidebarOpen 
  })),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  
  // Whiteboard Actions
  addWhiteboardElement: (el) => set((state) => ({ 
    whiteboardElements: [...state.whiteboardElements, el] 
  })),
  updateWhiteboardElement: (id, updates) => set((state) => ({
    whiteboardElements: state.whiteboardElements.map(el => el.id === id ? { ...el, ...updates } : el)
  })),
  removeWhiteboardElement: (id) => set((state) => ({
    whiteboardElements: state.whiteboardElements.filter(el => el.id !== id)
  })),

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
    set({
      annotations: previous,
      history: history.slice(0, -1),
      future: [JSON.parse(JSON.stringify(annotations)), ...future]
    });
  },

  redo: () => {
    const { future, annotations, history } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      annotations: next,
      history: [...history, JSON.parse(JSON.stringify(annotations))],
      future: future.slice(1)
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
  
  sendMessage: async (content, selection, assetType, options) => {
    const { v4: uuidv4 } = await import('uuid');
    const { selectedModel, activeDocumentId, documents } = get();
    
    // Determine which document to generate from (options override, then active, then first available)
    // Determine which document to generate from (options override, then active, then first available)
    const isWorkspaceWide = options?.targetDocumentId === 'all_workspace';
    const targetDocId = isWorkspaceWide ? null : (options?.targetDocumentId || activeDocumentId || documents[0]?.id);
    const targetDoc = isWorkspaceWide ? null : documents.find(d => d.id === targetDocId);
    const sourceLabel = isWorkspaceWide ? 'Entire Workspace' : (targetDoc?.name || 'Selection');

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: assetType ? `[SYSTEM: Generating ${assetType} from ${sourceLabel} with ${options?.tone || 'default'} tone]` : content,
      timestamp: Date.now(),
      relatedSelection: selection || undefined
    };

    set((state) => ({ 
        chatHistory: assetType ? state.chatHistory : [...state.chatHistory, userMessage],
        isLoading: !assetType,
        isGenerating: !!assetType,
        isSidebarOpen: assetType ? state.isSidebarOpen : true
    }));

    setTimeout(async () => {
        if (assetType) {
            const newAsset: GeneratedAsset = {
                id: uuidv4(),
                title: `${assetType.toUpperCase()} - ${sourceLabel}`,
                type: assetType,
                documentId: targetDocId || undefined,
                content: `### ${assetType.toUpperCase()} for ${sourceLabel}\n\n**Tone:** ${options?.tone || 'Standard'}\n**Creativity:** ${options?.creativity || 0.5}\n\n1. Automatically analyzed patterns in ${isWorkspaceWide ? 'all documents in this workspace' : 'the content'}...\n2. Extracted key entity relationships and thematic clusters.\n3. Synthesized findings in ${options?.tone || 'standard'} format.\n\nEnjoy your research!`,
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
                content: `[Model: ${selectedModel}]\n\nI've analyzed the ${selection?.type === 'area' ? 'selected area' : (selection ? 'selected text' : 'document')}. \n\nHow else can I help with this?`,
                timestamp: Date.now()
            };
            set((state) => ({ 
                chatHistory: [...state.chatHistory, aiMessage],
                isLoading: false
            }));
        }
    }, 2500);
  }
}));
