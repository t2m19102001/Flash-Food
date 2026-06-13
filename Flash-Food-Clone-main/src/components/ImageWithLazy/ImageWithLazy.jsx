// src/components/ImageWithLazy/ImageWithLazy.jsx
import { useState, useEffect, useRef } from 'react';
import './ImageWithLazy.scss';

const ImageWithLazy = ({ src, alt, className, placeholderSrc, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView && src) {
      const img = new Image();
      img.src = src;
      img.onload = () => setIsLoaded(true);
    }
  }, [isInView, src]);

  return (
    <div ref={imgRef} className={`lazy-image-container ${className || ''}`}>
      {!isLoaded && placeholderSrc && (
        <img src={placeholderSrc} alt="Loading" className="lazy-placeholder" />
      )}
      {isLoaded && (
        <img 
          src={src} 
          alt={alt} 
          className={`lazy-image ${isLoaded ? 'loaded' : ''}`}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

export default ImageWithLazy;