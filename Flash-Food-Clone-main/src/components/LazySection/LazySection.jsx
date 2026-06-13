// src/components/LazySection/LazySection.jsx
import { Suspense, useEffect, useState, useRef } from 'react';
import './LazySection.scss';

const LazySection = ({ children, component: Component, fallback, threshold = 0.1, rootMargin = '200px' }) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={sectionRef} className="lazy-section">
      {shouldLoad ? (
        <Suspense fallback={fallback || <DefaultLoader />}>
          {Component ? <Component /> : children}
        </Suspense>
      ) : (
        fallback || <DefaultLoader />
      )}
    </div>
  );
};

const DefaultLoader = () => (
  <div className="lazy-loader">
    <div className="loader-dot"></div>
    <div className="loader-dot"></div>
    <div className="loader-dot"></div>
  </div>
);

export default LazySection;