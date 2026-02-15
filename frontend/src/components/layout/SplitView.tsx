"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useAppState } from "@/store/useAppState";
import { cn } from "@/lib/utils";

interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function SplitView({ left, right }: SplitViewProps) {
  const { isSidebarOpen } = useAppState();

  return (
    // @ts-expect-error - react-resizable-panels types are slightly mismatched in this setup
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel defaultSize={70} minSize={20}>
        {left}
      </ResizablePanel>
      
      {isSidebarOpen && (
        <>
          <ResizableHandle withHandle className="w-1.5 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors cursor-col-resize" />
          <ResizablePanel defaultSize={30} minSize={20}>
            {right}
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
