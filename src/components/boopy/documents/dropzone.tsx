"use client";

import { Upload } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  statusLabel?: string | null;
  allowMultiple?: boolean;
};

export function DocumentDropzone({
  onFilesSelected,
  disabled,
  statusLabel,
  allowMultiple = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className="border-muted-foreground/20 bg-muted/20 flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (disabled) return;
        const files = Array.from(event.dataTransfer.files ?? []);
        if (files.length > 0) onFilesSelected(files);
      }}
    >
      <Upload className="text-muted-foreground size-6" />
      <p className="text-sm font-medium">
        Drop {allowMultiple ? "invoice(s) or receipt(s)" : "invoice or receipt"} here
      </p>
      <p className="text-muted-foreground text-xs">
        Supported best with text/PDF exports. You can review before any subscription is created.
      </p>
      {statusLabel ? <p className="text-primary text-xs font-medium">{statusLabel}</p> : null}
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {allowMultiple ? "Select file(s)" : "Select file"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple={allowMultiple}
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          if (files.length > 0) onFilesSelected(files);
          event.currentTarget.value = "";
        }}
      />
    </div>
  );
}
