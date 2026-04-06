"use client";

import React from "react";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  /** Controlled value (preferred for language switching). */
  value?: string;
  defaultValue?: string;
  /** Tab / window title (e.g. solution.ts). */
  fileName?: string;
  onChange?: (value: string) => void;
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
  onChange,
  className,
  readOnly = false,
}: CodeEditorProps) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internal;
  const lines = value.split("\n");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (!isControlled) setInternal(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={cn("pixel-box", className)}>
      <div className="flex items-center gap-2 border-b border-border/50 bg-secondary/30 px-4 py-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-rose-500/80" />
          <div className="h-3 w-3 rounded-full bg-amber-500/80" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-xs text-muted-foreground font-code">{fileName}</span>
      </div>

      <div className="flex max-h-[500px] overflow-auto">
        <div className="flex flex-col border-r border-border/30 bg-secondary/20 px-3 py-4 text-right font-code text-base text-muted-foreground select-none">
          {lines.map((_, i) => (
            <span key={i} className="leading-6">
              {i + 1}
            </span>
          ))}
        </div>

        <textarea
          value={value}
          onChange={handleChange}
          readOnly={readOnly}
          spellCheck={false}
          className={cn(
            "flex-1 resize-none bg-transparent p-4 font-code text-xs leading-6 text-foreground outline-none",
            "placeholder:text-muted-foreground/50",
          )}
          rows={Math.max(lines.length + 2, 8)}
          placeholder="// Schreibe deinen Code hier..."
        />
      </div>
    </div>
  );
}
