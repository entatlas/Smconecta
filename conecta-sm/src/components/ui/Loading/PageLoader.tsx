import React from 'react';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Carregando...' }: PageLoaderProps) {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 text-slate-400">
      <div className="relative flex items-center justify-center">
        {/* Glow effect */}
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-blue-500/20 blur-md"></div>
        
        {/* Spinner ring */}
        <div className="relative h-12 w-12 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin"></div>
      </div>
      <p className="animate-pulse text-sm font-medium tracking-wide">{message}</p>
    </div>
  );
}
