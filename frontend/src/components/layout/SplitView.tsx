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
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel defaultSize={70} minSize={20}>
        {left}
      </ResizablePanel>
      
      {isSidebarOpen && (
        <ResizableHandle withHandle />
      )}
      {isSidebarOpen && (
        <ResizablePanel defaultSize={30} minSize={20}>
          {right}
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
}
