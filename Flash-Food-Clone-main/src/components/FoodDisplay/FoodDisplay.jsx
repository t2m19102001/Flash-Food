import React, { useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import "./FoodDisplay.scss";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category }) => {
  const { food_list, search = "", userName } = useContext(StoreContext);
  const [visibleCount, setVisibleCount] = useState(10); // Mặc định hiển thị 10 món
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const displayName = userName || "bạn";

  // Lọc danh sách món ăn theo category và search
  const filteredList = useMemo(() => {
    if (!food_list.length) return [];
    
    return food_list.filter((item) => {
      if (!item) return false;
      
      const itemName = item.name ? item.name.toLowerCase() : "";
      const searchTerm = search.toLowerCase().trim();
      const itemCategoryStr = String(item.category);
      const categoryStr = String(category);

      // Nếu đang search thì bỏ qua category filter, hiển thị tất cả kết quả search
      if (search.trim() !== "") {
        return itemName.includes(searchTerm);
      }
      
      // Nếu không search thì filter theo category
      const matchesCategory = category === "All" || itemCategoryStr === categoryStr;
      const matchesSearch = itemName.includes(searchTerm);
      
      return matchesCategory && matchesSearch;
    });
  }, [food_list, search, category]);

  // Danh sách hiển thị
  const displayList = useMemo(() => {
    return filteredList.slice(0, visibleCount);
  }, [filteredList, visibleCount]);

  // Kiểm tra còn món để load thêm không
  const hasMore = filteredList.length > visibleCount;
  const remainingCount = filteredList.length - visibleCount;

  // Xử lý load thêm món ăn
  const handleLoadMore = useCallback(() => {
    setIsLoading(true);
    // Giả lập thời gian load (tạo cảm giác mượt)
    setTimeout(() => {
      setVisibleCount(prev => prev + 10);
      setIsLoading(false);
    }, 300);
  }, []);

  // Xử lý thu gọn về 10 món ban đầu
  const handleShowLess = useCallback(() => {
    setVisibleCount(10);
    // Scroll lên đầu danh sách món ăn
    const foodDisplay = document.getElementById('food-display');
    if (foodDisplay) {
      foodDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Intersection Observer để lazy load component
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "100px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Reset visibleCount khi category hoặc search thay đổi
  useEffect(() => {
    setVisibleCount(10);
  }, [category, search]);

  if (!isVisible) {
    return (
      <div className="food-display" id="food-display" ref={sectionRef}>
        <div className="food-display-header">
          <h2>
            <span className="section-icon">🍽️</span>
            Các món ăn gần bạn nhất
          </h2>
        </div>
        <div className="food-skeleton-grid">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="food-skeleton-card">
              <div className="skeleton-img shimmer"></div>
              <div className="skeleton-title shimmer"></div>
              <div className="skeleton-price shimmer"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="food-display" id="food-display" ref={sectionRef}>
      <div className="food-display-header">
        <h2>
          {search ? (
            <>
              <span className="search-icon">🔍</span>
              Kết quả tìm kiếm cho "<span className="search-term">{search}</span>"
            </>
          ) : (
            <>
              <span className="section-icon">🍽️</span>
              Các món ăn gần bạn nhất
            </>
          )}
        </h2>
        {search && (
          <p className="search-result-count">
            Tìm thấy {filteredList.length} món ăn
          </p>
        )}
      </div>

      {/* Danh sách món ăn */}
      <div className="food-display-list">
        {displayList.length > 0 ? (
          displayList.map((item, index) => (
            <FoodItem
              key={item._id || index}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
            />
          ))
        ) : (
          <div className="no-results">
            <div className="empty-icon">🍕</div>
            <h3>Không tìm thấy món ăn</h3>
            <p>Rất tiếc {displayName}, không có món nào phù hợp với tìm kiếm của bạn.</p>
            <small>💡 Thử tìm kiếm với từ khóa khác nhé!</small>
          </div>
        )}
      </div>

      {/* Nút Load More / Show Less */}
      {filteredList.length > 0 && (
        <div className="load-more-container">
          {hasMore && (
            <button 
              className="btn-load-more"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loader-icon"></span>
                  Đang tải...
                </>
              ) : (
                <>
                  Xem thêm {remainingCount > 10 ? 10 : remainingCount} món ăn
                  <svg className="arrow-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M7 10l5 5 5-5H7z" />
                  </svg>
                </>
              )}
            </button>
          )}
          
          {visibleCount > 10 && !hasMore && (
            <button className="btn-show-less" onClick={handleShowLess}>
              Thu gọn
              <svg className="arrow-icon up" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M7 14l5-5 5 5H7z" />
              </svg>
            </button>
          )}
          
          {/* Hiển thị số lượng đang hiển thị */}
          <div className="food-stats">
            Hiển thị {displayList.length} / {filteredList.length} món
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDisplay;