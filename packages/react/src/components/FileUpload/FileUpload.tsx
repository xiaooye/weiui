"use client";
import { forwardRef, useState, useRef } from "react";
import { cn } from "../../utils/cn";

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  disabled?: boolean;
  onChange?: (files: File[]) => void;
  className?: string;
  label?: string;
  hint?: string;
}

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      accept,
      multiple,
      maxSize,
      disabled,
      onChange,
      className,
      label = "Click or drag files here",
      hint,
    },
    ref,
  ) => {
    const [files, setFiles] = useState<File[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (fileList: FileList | null) => {
      if (!fileList) return;
      let newFiles = Array.from(fileList);
      if (maxSize) newFiles = newFiles.filter((f) => f.size <= maxSize);
      const updated = multiple ? [...files, ...newFiles] : newFiles.slice(0, 1);
      setFiles(updated);
      onChange?.(updated);
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
      </div>
    );
  },
);
FileUpload.displayName = "FileUpload";
