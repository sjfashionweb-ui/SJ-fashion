import { useState } from "react";
import { ImageOff } from "lucide-react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
}

export function ImageWithFallback({ 
  src, 
  alt, 
  className, 
  fallbackText = "SJ LANKA FASHION", 
  ...props 
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // If the image errors out or the src is completely missing, show the branded fallback
  if (error || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-neutral-900 border border-white/5 ${className}`}>
        <ImageOff className="w-8 h-8 mb-2 text-neutral-600" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase text-center px-2">
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Show a pulsing skeleton loader while the image is downloading over the network */}
      {!loaded && (
        <div className={`absolute inset-0 bg-neutral-800 animate-pulse ${className}`} />
      )}
      
      {/* The actual image */}
      <img
        src={src}
        alt={alt}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        {...props}
      />
    </>
  );
}