'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type ImageUploaderProps = {
  onImageSelect: (files: FileList) => void;
  isLoading: boolean;
  multiple?: boolean;
};

export default function ImageUploader({ onImageSelect, isLoading, multiple = false }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0 && !isLoading) {
      const allImages = Array.from(files).every(file => file.type.startsWith('image/'));
      if (allImages) {
        onImageSelect(files);
      } else {
        toast({
          title: 'Invalid File Type',
          description: 'Please select only image files.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset the input value to allow selecting the same file again
    if(e.target) e.target.value = '';
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        'relative w-full border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ease-in-out',
        isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50',
        isLoading && 'cursor-not-allowed opacity-70 bg-secondary'
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
        disabled={isLoading}
        multiple={multiple}
      />
      <div className="flex flex-col items-center gap-4">
        {isLoading ? (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="font-semibold text-lg text-primary">Analyzing your plant...</p>
            <p className="text-muted-foreground">This may take a moment.</p>
          </>
        ) : (
          <>
            <div className="bg-primary/10 p-4 rounded-full">
              <UploadCloud className="h-8 w-8 text-primary" />
            </div>
            <p className="font-semibold text-lg mt-2">Drag & drop your image(s) here</p>
            <p className="text-muted-foreground">or</p>
            <Button onClick={handleBrowseClick} disabled={isLoading} className="font-bold">
              Browse Files
            </Button>
            <p className="text-xs text-muted-foreground mt-2">High-quality JPG, PNG, or WEBP recommended.</p>
          </>
        )}
      </div>
    </div>
  );
}
