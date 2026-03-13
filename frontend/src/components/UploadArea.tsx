import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

export interface UploadAreaProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  preview: string | null;
  setPreview: (url: string | null) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ setSelectedFile, preview, setPreview }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(file));
      }
    }
  };

  const clearPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      className={`relative h-full rounded-xl border-2 border-dashed p-8 transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center overflow-hidden cursor-pointer group ${
        isDragActive 
          ? 'border-purple-500 bg-purple-500/10 scale-[1.02]' 
          : preview ? 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600' : 'border-zinc-700 bg-zinc-900/30 hover:border-purple-500/60 hover:bg-zinc-900/60'
      }`}
      onDragEnter={handleDragOver}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !preview && fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        accept="image/jpeg, image/png, image/webp" 
        className="hidden" 
      />

      {preview ? (
        <div className="absolute inset-0 w-full h-full p-2 group">
           <img src={preview} alt="Upload preview" className="w-full h-full object-cover rounded-lg border border-zinc-700/50" />
           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg m-2 flex flex-col items-center justify-center">
              <button onClick={clearPreview} className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors mb-2">
                <X className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-white shadow-black drop-shadow-md">Remove Image</span>
           </div>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="w-14 h-14 mb-4 rounded-full bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
            <UploadCloud className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
          </div>
          
          <h3 className="text-sm font-medium text-zinc-200 mb-1.5 relative z-10">Upload Scene Image</h3>
          <p className="text-xs text-zinc-500 mb-5 relative z-10">Drag & drop or click to browse</p>
          
          <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-600 bg-zinc-950/50 px-3 py-1.5 rounded-full">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>JPG, PNG, WEBP</span>
          </div>
        </>
      )}
    </div>
  );
};
