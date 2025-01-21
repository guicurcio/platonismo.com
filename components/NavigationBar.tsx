"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Home, ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Layers,
  HelpCircle,
  ChevronRight,
  Grid,
  Lock,
  Unlock,
  Moon,
  Sun,
  PlusCircle,
  Settings as SettingsIcon,
  MessageCircle,
  StickyNote
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

import { AdvancedChatSettingsModal } from "@/components/modals/AdvancedChatSettingsModal";
import { ChangelogModal } from "@/components/modals/ChangelogModal";

export interface AdvancedSettings {
  systemMessage: string;
  model: "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-4" | "gpt-4-32k";
  temperature: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
}

interface NavigationBarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  canvases?: { id: string; name: string }[];
  selectedCanvasIndex?: number;
  onCreateCanvas?: () => void;
  onSwitchCanvas?: (index: number) => void;
  onDeleteCanvas?: (index: number) => void;
  advancedSettings: AdvancedSettings;
  setAdvancedSettings: (settings: AdvancedSettings) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;

  onInsertChatNode?: () => void;
  onInsertNoteNode?: () => void;
  onInsertFunctionChatNode?: () => void;
  onInsertModelNode?: () => void;
  onHome?: () => void;

  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
}

interface NavItem {
  icon: React.ComponentType<any>;
  label: string;
  shortcut?: string;
  action?: () => void;
  isTool?: boolean;
  isAction?: boolean;
}

export default function NavigationBar({
  onUndo,
  onRedo,
  canUndo = true,
  canRedo = true,
  canvases = [],
  selectedCanvasIndex = 0,
  onCreateCanvas,
  onSwitchCanvas,
  onDeleteCanvas,
  advancedSettings,
  setAdvancedSettings,
  onZoomIn,
  onZoomOut,
  onInsertChatNode,
  onInsertNoteNode,
  onInsertFunctionChatNode,
  onInsertModelNode,
  onHome,
  isSelectionMode,
  onToggleSelectionMode,
}: NavigationBarProps) {
  const [activeTool, setActiveTool] = useState<string>("Select");
  const [isGridVisible, setIsGridVisible] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [gridSize, setGridSize] = useState<number>(20);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();
  const [isWindows, setIsWindows] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const handleToggleChangelog = useCallback(() => {
    setIsChangelogOpen((prev) => !prev);
  }, []);

  const [isCanvasManagerOpen, setIsCanvasManagerOpen] = useState(false);

  const [isAdvancedDialogOpen, setIsAdvancedDialogOpen] = useState(false);

  const insertMenuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsWindows(navigator.platform.indexOf("Win") > -1);
  }, []);

  const handleUndo = useCallback(() => {
    onUndo?.();
  }, [onUndo]);

  const handleRedo = useCallback(() => {
    onRedo?.();
  }, [onRedo]);

  const toggleGrid = useCallback(() => {
    setIsGridVisible((prev) => !prev);
  }, []);

  const toggleLock = useCallback(() => {
    setIsLocked((prev) => !prev);
  }, []);

  const toggleSnapToGrid = useCallback(() => {
    setSnapToGrid((prev) => !prev);
  }, []);

  const handleInsert = useCallback(() => {
    insertMenuRef.current?.click();
  }, []);

  const insertItems: NavItem[] = [
    {
      icon: MessageCircle,
      label: "Chat Node",
      action: onInsertChatNode,
    },
    {
      icon: StickyNote,
      label: "Note Node",
      action: onInsertNoteNode,
    },
  ];

  const navItems: NavItem[] = [
    {
      icon: Home,
      label: "Home",
      shortcut: "Ctrl+H",
      action: onHome,
      isTool: true,
    },

    {
      icon: ZoomInIcon,
      label: "Zoom In",
      shortcut: "Ctrl+=",
      action: onZoomIn,
      isAction: true,
    },
    {
      icon: ZoomOutIcon,
      label: "Zoom Out",
      shortcut: "Ctrl+-",
      action: onZoomOut,
      isAction: true,
    },
    {
      icon: PlusCircle,
      label: "Insert",
      shortcut: "Ctrl+N",
      action: handleInsert,
      isAction: true,
    },
  ];

  const menuItems: NavItem[] = [
    {
      icon: Grid,
      label: "Toggle Grid",
      shortcut: "G",
      action: toggleGrid,
      isAction: true,
    },
    {
      icon: isLocked ? Lock : Unlock,
      label: isLocked ? "Unlock Canvas" : "Lock Canvas",
      shortcut: "X",
      action: toggleLock,
      isAction: true,
    },
    {
      icon: HelpCircle,
      label: "Help",
      shortcut: "?",
      action: () => console.log("Help"),
      isAction: true,
    },
  ];

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const modifierKey = isWindows ? event.ctrlKey : event.metaKey;

      [...navItems, ...menuItems].forEach((item) => {
        if (!item.shortcut) return;

        const parts = item.shortcut.toLowerCase().split("+");
        const lastKey = parts[parts.length - 1];

        if (modifierKey && event.key.toLowerCase() === lastKey) {
          item.action?.();

          if (item.isTool) {
            if (item.label !== "Select") {
              setActiveTool(item.label);
            }
          }

          event.preventDefault();
        }
      });
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isWindows, navItems, menuItems]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={cn(
          "fixed z-50 transition-all duration-300 ease-in-out",
          isCollapsed
            ? "bottom-2 left-2"
            : "inset-x-0 bottom-[50px] flex justify-center"
        )}
      >
        <nav
          className={cn(
            "flex items-center gap-1 bg-secondary/90 border border-border backdrop-blur-md px-3 py-2 rounded-full shadow-xl transition-all duration-300",
            isCollapsed && "flex-col items-start p-2 rounded-lg"
          )}
          role="toolbar"
          aria-label="Canvas tools"
        >
          <TooltipProvider delayDuration={300}>
            {isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="mb-2 bg-secondary/90 hover:bg-muted/20 rounded-full shadow-md p-1"
                onClick={() => setIsCollapsed(false)}
                aria-label="Expand navigation"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {/* Main nav items */}
            {navItems.map((item) => (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  {item.label === "Insert" ? (
                    /* =================== INSERT MENU =================== */
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          ref={insertMenuRef}
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "text-foreground hover:bg-muted/20 rounded-full transition-all p-1",
                            "data-[state=open]:bg-muted/20",
                            isCollapsed && "mb-2"
                          )}
                          aria-label={item.label}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="sr-only">{item.label}</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="bg-popover border text-foreground">
                        <DropdownMenuLabel>Insert Node</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {insertItems.map((insertItem) => (
                          <DropdownMenuItem
                            key={insertItem.label}
                            onClick={insertItem.action}
                          >
                            <insertItem.icon className="mr-2 h-4 w-4" />
                            <span>{insertItem.label}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    /* =================== NORMAL BUTTON =================== */
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "text-foreground hover:bg-muted/20 rounded-full transition-all p-1",

                        item.isTool &&
                          (item.label === "Select"
                            ? isSelectionMode
                            : activeTool === item.label) &&
                          "bg-muted/30",
                        isCollapsed && "mb-2"
                      )}
                      onClick={() => {
                        item.action?.();

                        if (item.isTool && item.label !== "Select") {
                          setActiveTool(item.label);
                        }
                      }}
                      aria-label={item.label}
                      aria-pressed={
                        item.isTool &&
                        (item.label === "Select"
                          ? isSelectionMode
                          : activeTool === item.label)
                      }
                      tabIndex={0}
                      disabled={
                        (item.label === "Undo" && !canUndo) ||
                        (item.label === "Redo" && !canRedo)
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="sr-only">{item.label}</span>
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent
                  side={isCollapsed ? "right" : "bottom"}
                  className="flex items-center gap-2"
                >
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <span className="text-xs text-muted-foreground">
                      {item.shortcut}
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Additional Tools Dropdown (Layers icon, etc.) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-foreground hover:bg-muted/20 rounded-full transition-all p-1",
                    isCollapsed && "mb-2"
                  )}
                  aria-label="Extra Tools"
                >
                  <Layers className="h-5 w-5" />
                  <span className="sr-only">Extra Tools</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-popover border text-foreground"
                align={isCollapsed ? "end" : "start"}
              >
                <DropdownMenuLabel>Extra Tools</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {menuItems.map((item) => (
                  <DropdownMenuItem key={item.label} onClick={item.action}>
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-foreground hover:bg-muted/20 rounded-full transition-all p-1",
                    isCollapsed && "mb-2"
                  )}
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  aria-label="Toggle theme"
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isCollapsed ? "right" : "bottom"}>
                <span>Toggle theme</span>
              </TooltipContent>
            </Tooltip>

            {/* Advanced Settings (gear icon) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-foreground hover:bg-muted/20 rounded-full transition-all p-1",
                    isCollapsed && "mb-2"
                  )}
                  onClick={() => setIsAdvancedDialogOpen(true)}
                  aria-label="Advanced Settings"
                >
                  <SettingsIcon className="h-5 w-5" />
                  <span className="sr-only">Advanced Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isCollapsed ? "right" : "bottom"}>
                <span>Advanced Settings</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>

        {/* 1) Advanced Chat Settings Modal */}
        <AdvancedChatSettingsModal
          isOpen={isAdvancedDialogOpen}
          onOpenChange={setIsAdvancedDialogOpen}
          advancedSettings={advancedSettings}
          setAdvancedSettings={setAdvancedSettings}
        />

        {/* 2) Changelog Modal */}
        <ChangelogModal
          isOpen={isChangelogOpen}
          onOpenChange={setIsChangelogOpen}
        />
      </motion.div>
    </AnimatePresence>
  );
}
