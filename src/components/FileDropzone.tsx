import { useState, DragEvent, useRef, ChangeEvent } from 'react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  onFilesRejected?: (files: { file: File; reason: string }[]) => void;
  accept?: string[];
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
}

export function NativeFileUploader({
  onFilesSelected,
  onFilesRejected,
  accept,
  maxSize = 10 * 1024 * 1024,
  maxFiles = 10,
  multiple = true,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]) => {
    const accepted: File[] = [];
    const rejected: { file: File; reason: string }[] = [];

    files.forEach((file) => {
      if (accepted.length >= maxFiles) {
        rejected.push({ file, reason: `Maximum ${maxFiles} files allowed` });
        return;
      }

      if (accept && accept.length > 0) {
        const fileType = file.type;
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        const isAccepted = accept.some((type) => {
          if (type.startsWith('.')) {
            return fileExtension === type.toLowerCase();
          }
          if (type.endsWith('/*')) {
            return fileType.startsWith(type.replace('/*', '/'));
          }
          return fileType === type;
        });

        if (!isAccepted) {
          rejected.push({ file, reason: `File type not accepted` });
          return;
        }
      }

      if (file.size > maxSize) {
        rejected.push({
          file,
          reason: `File exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`
        });
        return;
      }

      accepted.push(file);
    });

    return { accepted, rejected };
  };

  const handleFiles = (files: File[]) => {
    const { accepted, rejected } = validateFiles(files);

    if (accepted.length > 0) {
      onFilesSelected(accepted);
    }

    if (rejected.length > 0 && onFilesRejected) {
      onFilesRejected(rejected);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
      e.target.value = '';
    }
  };

  const acceptString = accept?.join(',');

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${isDragging ? '#2196f3' : '#ccc'}`,
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        backgroundColor: isDragging ? '#e3f2fd' : '#fafafa',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        onChange={handleInputChange}
        accept={acceptString}
        multiple={multiple}
        style={{ display: 'none' }}
      />
      {isDragging ? (
        <p style={{ margin: 0, color: '#2196f3' }}>Drop files here...</p>
      ) : (
        <div>
          <p style={{ margin: '0 0 8px 0' }}>
            Drag and drop files here, or click to select
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            Max {maxFiles} file, {Math.round(maxSize / 1024 / 1024)}MB each
          </p>
        </div>
      )}
    </div>
  );
}