"use client"

import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
  className,
  direction = "horizontal",
  ...props
}: any) => (
  <ResizablePrimitive.Group
    data-slot="resizable-panel-group"
    direction={direction}
    className={cn(
      "flex h-full w-full data-[direction=vertical]:flex-col data-[panel-group-direction=vertical]:flex-col aria-[orientation=vertical]:flex-col",
      className
    )}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: any) => (
  <ResizablePrimitive.Separator
    data-slot="resizable-handle"
    className={cn(
      "relative flex w-2 items-center justify-center bg-transparent group/handle cursor-col-resize transition-all hover:w-3 z-50",
      "data-[orientation=horizontal]:w-full data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:cursor-row-resize data-[orientation=horizontal]:hover:h-3",
      "aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:h-2 aria-[orientation=horizontal]:cursor-row-resize aria-[orientation=horizontal]:hover:h-3",
      className
    )}
    {...props}
  >
    {/* The visible line */}
    <div className="h-full w-0.5 bg-border group-hover/handle:bg-primary transition-colors data-[orientation=horizontal]:w-full data-[orientation=horizontal]:h-0.5 aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:h-0.5" />
    
    {withHandle && (
      <div className="absolute z-10 flex h-6 w-4 items-center justify-center rounded-sm border bg-background shadow-sm hover:bg-muted transition-colors">
        <GripVertical className="size-3 text-muted-foreground data-[orientation=horizontal]:rotate-90 aria-[orientation=horizontal]:rotate-90" />
      </div>
    )}
  </ResizablePrimitive.Separator>
)


export { ResizableHandle, ResizablePanel, ResizablePanelGroup }

