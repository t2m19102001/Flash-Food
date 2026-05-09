import { lazy, Suspense, useState, useEffect, useCallback, useMemo, startTransition } from 'react';
import Header from '../../components/Header/Header';
import './Home.scss';

// Lazy load components - chỉ tải khi cần
const Menu = lazy(() => import('../../components/ExploreMenu/Menu'));
const FoodDisplay = lazy(() => import('../../components/FoodDisplay/FoodDisplay'));

// Loading skeletons đẹp mắt
const MenuSkeleton = () => (
  <div className="menu-skeleton">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="menu-skeleton-item">
        <div className="skeleton-circle"></div>
        <div className="skeleton-text"></div>
      </div>
    ))}
  </div>
);

const FoodSkeleton = () => (
  <div className="food-skeleton">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="food-skeleton-card">
        <div className="skeleton-image"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-price"></div>
      </div>
    ))}
  </div>
);

const Home = () => {
  const [category, setCategory] = useState("All");
  const [menuReady, setMenuReady] = useState(false);
  const [foodReady, setFoodReady] = useState(false);

  // Xử lý change category, tránh re-render không cần thiết
  const handleCategoryChange = useCallback((newCategory) => {
    startTransition(() => {
      setCategory(newCategory);
    });
  }, []);

  // Prefetch FoodDisplay khi user rảnh
  useEffect(() => {
    const prefetchFood = () => {
      import('../../components/FoodDisplay/FoodDisplay');
      setFoodReady(true);
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetchFood, { timeout: 2000 });
    } else {
      setTimeout(prefetchFood, 1500);
    }
  }, []);

  // Memoize props để tối ưu performance
  const menuProps = useMemo(() => ({
    category,
    setCategory: handleCategoryChange
  }), [category, handleCategoryChange]);

  const foodProps = useMemo(() => ({
    category
  }), [category]);

  return (
    <div className="home">
      <Header />
      
      <main className="home-main">
        <div className="home-container">
          {/* Menu Section - lazy load */}
          <Suspense fallback={<MenuSkeleton />}>
            <Menu {...menuProps} />
          </Suspense>
          
          {/* FoodDisplay Section - lazy load */}
          <Suspense fallback={<FoodSkeleton />}>
            <FoodDisplay {...foodProps} />
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default Home;