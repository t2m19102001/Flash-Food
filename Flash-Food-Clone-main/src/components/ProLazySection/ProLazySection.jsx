// src/components/ProLazySection/ProLazySection.jsx
import { Suspense, lazy, useState, useEffect } from 'react';
import { useLazyLoad } from '../../hooks/useLazyLoad';
import './ProLazySection.scss';

const ProLazySection = ({ 
  component: Component, 
  fallback: CustomFallback,
  preloadDelay = 0,
  priority = false,
  rootMargin = '200px',
  ...props 
}) => {
  const { elementRef, isVisible } = useLazyLoad({ 
    threshold: 0.05,
    rootMargin: priority ? '400px' : rootMargin
  });
  
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [LazyComponent, setLazyComponent] = useState(null);

  useEffect(() => {
    if (isVisible && !shouldLoad) {
      const timer = setTimeout(() => {
        setShouldLoad(true);
        const loadComponent = async () => {
          const module = await Component();
          setLazyComponent(() => module.default || module);
        };
        loadComponent();
      }, preloadDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldLoad, Component, preloadDelay]);

  useEffect(() => {
    if (priority && !LazyComponent) {
      const loadComponent = async () => {
        const module = await Component();
        setLazyComponent(() => module.default || module);
      };
      loadComponent();
    }
  }, [priority, LazyComponent, Component]);

  const DefaultFallback = () => (
    <div className="pro-lazy-placeholder">
      <div className="shimmer-effect">
        <div className="shimmer-line"></div>
        <div className="shimmer-line"></div>
        <div className="shimmer-line short"></div>
      </div>
    </div>
  );

  const FallbackComponent = CustomFallback || DefaultFallback;

  return (
    <div ref={elementRef} className="pro-lazy-section">
      {shouldLoad && LazyComponent ? (
        <Suspense fallback={<FallbackComponent />}>
          <LazyComponent {...props} />
        </Suspense>
      ) : (
        <FallbackComponent />
      )}
    </div>
  );
};

export default ProLazySection;