"use client";
import { forwardRef, useState, useRef } from "react";
import { cn } from "../../utils/cn";

export type FileUploadError = {
  reason: "size" | "type" | "count";
  file: File;
  message: string;
};

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  onChange?: (files: File[]) => void;
  onError?: (error: FileUploadError) => void;
  className?: string;
  label?: string;
  hint?: string;
}

function matchesAccept(file: File, accept: string): boolean {
  const patterns = accept.split(",").map((s) => s.trim()).filter(Boolean);
  if (patterns.length === 0) return true;
  return patterns.some((pattern) => {
    if (pattern.startsWith(".")) {
      return file.name.toLowerCase().endsWith(pattern.toLowerCase());
    }
    if (pattern.endsWith("/*")) {
      const base = pattern.slice(0, -1);
      return file.type.startsWith(base);
    }
    return file.type === pattern;
  });
}

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      accept,
      multiple,
      maxSize,
      maxFiles,
      disabled,
      onChange,
      onError,
      className,
      label = "Click or drag files here",
      hint,
    },
    ref,
  ) => {
    const [files, setFiles] = useState<File[]>([]);
    const [errors, setErrors] = useState<FileUploadError[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (fileList: FileList | null) => {
      if (!fileList) return;
      const incoming = Array.from(fileList);
      const accepted: File[] = [];
      const rejections: FileUploadError[] = [];

      for (const file of incoming) {
        if (maxSize !== undefined && file.size > maxSize) {
          rejections.push({
            reason: "size",
            file,
            message: `${file.name} exceeds the maximum size of ${maxSize} bytes.`,
          });
          continue;
        }
        if (accept && !matchesAccept(file, accept)) {
          rejections.push({
            reason: "type",
            file,
            message: `${file.name} is not an accepted file type.`,
          });
          continue;
        }
        accepted.push(file);
      }

      const limit = maxFiles;
      let final = multiple ? [...files, ...accepted] : accepted.slice(0, 1);
      if (limit !== undefined && final.length > limit) {
        const overflow = final.slice(limit);
        final = final.slice(0, limit);
        for (const file of overflow) {
          rejections.push({
            reason: "count",
            file,
            message: `${file.name} exceeds the maximum of ${limit} files.`,
          });
        }
      }

      for (const rejection of rejections) {
        onError?.(rejection);
      }

      setErrors(rejections);
      setFiles(final);
      onChange?.(final);
    };

    const removeFile = (index: number) => {
      const updated = files.filter((_, i) => i !== index);
      setFiles(updated);
      onChange?.(updated);
    };

    return (
      <div
        ref={ref}
        className={cn("wui-file-upload", className)}
        data-disabled={disabled || undefined}
        data-dragover={isDragOver || undefined}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-label="Upload file"
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: "none" }}
          tabIndex={-1}
        />
        <span className="wui-file-upload__text">{label}</span>
        {hint && <span className="wui-file-upload__hint">{hint}</span>}
        {files.length > 0 && (
          <div className="wui-file-upload__list" onClick={(e) => e.stopPropagation()}>
            {files.map((file, i) => (
              <div key={`${file.name}-${i}`} className="wui-file-upload__file">
                <span>{file.name}</span>
                <button
                  type="button"
                  className="wui-file-upload__file-remove"
                  aria-label={`Remove ${file.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        {errors.length > 0 && (
          <div
            className="wui-file-upload__errors"
            role="alert"
            aria-live="polite"
            onClick={(e) => e.stopPropagation()}
          >
            {errors.map((err, i) => (
              <div key={i} className="wui-file-upload__error">
                {err.message}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);
FileUpload.displayName = "FileUpload";
