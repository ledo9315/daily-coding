"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef } from "react";
import type { editor } from "monaco-editor";
import type { Monaco } from "@monaco-editor/react";
import { monacoLanguageId, type CodeLanguageId } from "@/lib/challenge-languages";
import {
  MONACO_THEME_FRAPPE,
  registerCatppuccinFrappeTheme,
} from "@/lib/monaco-catppuccin-frappe";
import { cn } from "@/lib/utils";

const Editor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-secondary/20 font-code text-sm text-muted-foreground">
        Editor wird geladen…
      </div>
    ),
  }
);

interface CodeEditorProps {
  value?: string;
  defaultValue?: string;
  fileName?: string;
  /** Syntax highlighting / language mode (Monaco). */
  language?: CodeLanguageId;
  onChange?: (value: string) => void;
  /** Ctrl/Cmd+S while the editor has focus. Registered as a Monaco keybinding, so it
   *  fires only there and never steals the browser's save dialog elsewhere on the page. */
  onSaveShortcut?: () => void;
  className?: string;
  readOnly?: boolean;
}

const defaultCode = `function transformArray(arr) {
  // Implementiere deine Lösung hier
  
  return arr;
}

// Beispiel:
// Input: [1, 2, 3, 4, 5]
// Output: [1, 3, 6, 10, 15]
`;

export function CodeEditor({
  value: controlledValue,
  defaultValue = defaultCode,
  fileName = "solution.js",
  language = "javascript",
  onChange,
  onSaveShortcut,
  className,
  readOnly = false,
}: CodeEditorProps) {
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : defaultValue;

  // The command is registered once on mount; the ref keeps it calling the current handler
  // instead of the one that existed back then.
  const saveShortcutRef = useRef(onSaveShortcut);
  saveShortcutRef.current = onSaveShortcut;

  const handleBeforeMount = useCallback((monaco: Monaco) => {
    registerCatppuccinFrappeTheme(monaco);
  }, []);

  const handleMount = useCallback(
    (ed: editor.IStandaloneCodeEditor, monaco: Monaco) => {
      registerCatppuccinFrappeTheme(monaco);
      // CtrlCmd is Cmd on macOS and Ctrl everywhere else.
      ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () =>
        saveShortcutRef.current?.()
      );
    },
    []
  );

  const options = useMemo<editor.IStandaloneEditorConstructionOptions>(
    () => ({
      minimap: { enabled: false },
      fontSize: 14,
      lineHeight: 24,
      fontFamily:
        "var(--font-jetbrains-mono, ui-monospace), JetBrains Mono, monospace",
      fontLigatures: false,
      padding: { top: 16, bottom: 16 },
      scrollBeyondLastLine: false,
      renderLineHighlight: "line",
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      readOnly,
      wordWrap: "on",
      tabSize: 2,
      insertSpaces: true,
      detectIndentation: false,
      automaticLayout: true,
      fixedOverflowWidgets: true,
      glyphMargin: false,
      folding: true,
      lineNumbers: "on",
      lineNumbersMinChars: 3,
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: false,
    }),
    [readOnly]
  );

  return (
    // The height lives on the outer box so a caller can stretch it — `h-[500px]` is the
    // default that `cn` lets a passed class override. Monaco itself fills what it is given.
    <div className={cn("pixel-box flex h-[500px] flex-col overflow-hidden", className)}>
      <div className="flex items-center gap-2 border-b border-border/50 bg-secondary/30 px-4 py-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-rose-500/80" />
          <div className="h-3 w-3 rounded-full bg-amber-500/80" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
        </div>
        <span className="font-code text-xs text-muted-foreground">{fileName}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Editor
          key={`${monacoLanguageId(language)}-${fileName}`}
          height="100%"
          theme={MONACO_THEME_FRAPPE}
          language={monacoLanguageId(language)}
          path={fileName}
          value={isControlled ? value : undefined}
          defaultValue={isControlled ? undefined : value}
          onChange={(v) => {
            if (v != null) onChange?.(v);
          }}
          beforeMount={handleBeforeMount}
          onMount={handleMount}
          options={options}
        />
      </div>
    </div>
  );
}
