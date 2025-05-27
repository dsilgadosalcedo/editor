import { useEffect } from "react";
import { useTheme } from "next-themes";

export const useGlobalKeyboardShortcuts = () => {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input field or contentEditable element
      const target = e.target as HTMLElement;
      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA");

      // Handle modifier key shortcuts
      const modifier = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (modifier) {
        // Toggle theme with Ctrl/Cmd+Shift+L (only when not typing in inputs)
        if (key === "l" && e.shiftKey && !isTyping) {
          e.preventDefault();
          setTheme(theme === "dark" ? "light" : "dark");
          return;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setTheme, theme]);
};
