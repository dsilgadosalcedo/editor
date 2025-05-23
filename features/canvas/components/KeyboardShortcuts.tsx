import React, { useState, useEffect } from "react";
import { X, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const shortcuts = [
  { keys: ["Backspace"], description: "Delete selected element" },
  { keys: ["Escape"], description: "Clear selection" },
  { keys: ["Ctrl", "S"], description: "Save canvas" },
  { keys: ["Ctrl", "O"], description: "Load canvas" },
  { keys: ["Ctrl", "A"], description: "Select all / Clear selection" },
  { keys: ["Ctrl", "Z"], description: "Undo" },
  { keys: ["Ctrl", "Shift", "Z"], description: "Redo" },
  { keys: ["Ctrl", "C"], description: "Copy element" },
  { keys: ["Ctrl", "V"], description: "Paste element" },
  { keys: ["Ctrl", "↑"], description: "Move element up one layer" },
  { keys: ["Ctrl", "↓"], description: "Move element down one layer" },
  { keys: ["?"], description: "Show keyboard shortcuts" },
];

const KeyboardShortcuts: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts on ? or F1
      if (e.key === "?" || e.key === "F1") {
        e.preventDefault();
        setIsVisible(true);
      }
      // Hide on Escape
      if (e.key === "Escape" && isVisible) {
        e.preventDefault();
        setIsVisible(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-700 dark:text-gray-300">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <React.Fragment key={keyIndex}>
                    {keyIndex > 0 && (
                      <span className="text-gray-400 mx-1">+</span>
                    )}
                    <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded border border-gray-300 dark:border-slate-600">
                      {key === "Ctrl"
                        ? navigator.platform.includes("Mac")
                          ? "⌘"
                          : "Ctrl"
                        : key}
                    </kbd>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press{" "}
            <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-slate-700 rounded">
              Escape
            </kbd>{" "}
            or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
