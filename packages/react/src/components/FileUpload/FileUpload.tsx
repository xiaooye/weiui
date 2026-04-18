"use client";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useControllable } from "@weiui/headless";
import { cn } from "../../utils/cn";

export type FileUploadError = {
  reason: "size" | "type" | "count";
  file: File;
  message: string;
};

export interface FileUploadProps {
  /** Comma-separated list of accepted MIME types or file extensions. */
  accept?: string;
  /** Allows selecting multiple files. */
  multiple?: boolean;
  /** Maximum size per file, in bytes. */
  maxSize?: number;
  /** Maximum total number of files that may be selected. */
  maxFiles?: number;
  /** Disables interaction and applies the disabled styling. */
  disabled?: boolean;
  /** Called when the accepted file list changes. */
  onChange?: (files: File[]) => void;
  /** Called when a file is rejected for size, type, or count. */
  onError?: (error: FileUploadError) => void;
  /** Additional CSS classes merged onto the root element. */
  className?: string;
  /** Accessible label shown above the dropzone. */
  label?: string;
  /** Helper text shown below the dropzone. */
  hint?: string;
  /** Controlled file list. Pair with `onFilesChange`. */
  files?: File[];
  /** Controlled-mode callback when files change. */
  onFilesChange?: (files: File[]) => void;
  /** Upload progress per file keyed by `file.name` (0–100). */
  progress?: Record<string, number>;
  /** Render image thumbnail previews for image-typed files. */
  thumbnails?: boolean;
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
      files: controlledFiles,
      onFilesChange,
      progress,
      thumbnails,
    },
    ref,
  ) => {
    const [files, setFiles] = useControllable<File[]>({
      value: controlledFiles,
      defaultValue: [],
      onChange: onFilesChange,
    });
    const [errors, setErrors] = useState<FileUploadError[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Object URLs keyed by file reference so we can revoke on unmount / replace.
    const urlMapRef = useRef<Map<File, string>>(new Map());

    const previewUrls = useMemo(() => {
      if (!thumbnails) return new Map<File, string>();
      const fresh = new Map<File, string>();
      for (const file of files ?? []) {
        if (!file.type.startsWith("image/")) continue;
        const existing = urlMapRef.current.get(file);
        if (existing) {
          fresh.set(file, existing);
        } else if (typeof URL !== "undefined" && URL.createObjectURL) {
          try {
            fresh.set(file, URL.createObjectURL(file));
          } catch {
            // ignore — some environments (SSR / old jsdom) lack support
          }
        }
      }
      // Revoke URLs no longer referenced.
      for (const [file, url] of urlMapRef.current) {
        if (!fresh.has(file) && typeof URL !== "undefined" && URL.revokeObjectURL) {
          try {
            URL.revokeObjectURL(url);
          } catch {
            /* ignore */
          }
        }
      }
      urlMapRef.current = fresh;
      return fresh;
    }, [files, thumbnails]);

    useEffect(() => {
      return () => {
        for (const url of urlMapRef.current.values()) {
          if (typeof URL !== "undefined" && URL.revokeObjectURL) {
            try {
              URL.revokeObjectURL(url);
            } catch {
              /* ignore */
            }
          }
        }
      };
    }, []);

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
      const current = files ?? [];
      let final = multiple ? [...current, ...accepted] : accepted.slice(0, 1);
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
      const current = files ?? [];
      const updated = current.filter((_, i) => i !== index);
      setFiles(updated);
      onChange?.(updated);
    };

    const currentFiles = files ?? [];

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
        {currentFiles.length > 0 && (
          <div className="wui-file-upload__list" onClick={(e) => e.stopPropagation()}>
            {currentFiles.map((file, i) => {
              const pct = progress ? progress[file.name] : undefined;
              const thumb = thumbnails ? previewUrls.get(file) : undefined;
              return (
                <div key={`${file.name}-${i}`} className="wui-file-upload__file">
                  {thumb && (
                    <img
                      src={thumb}
                      alt=""
                      className="wui-file-upload__thumb"
                      aria-hidden="true"
                    />
                  )}
                  <div className="wui-file-upload__file-body">
                    <span className="wui-file-upload__file-name">{file.name}</span>
                    {pct !== undefined && (
                      <div
                        className="wui-file-upload__progress"
                        role="progressbar"
                        aria-label={`${file.name} upload progress`}
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="wui-file-upload__progress-bar"
                          style={{ inlineSize: `${Math.max(0, Math.min(100, pct))}%` }}
                        />
                      </div>
                    )}
                  </div>
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
              );
            })}
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
