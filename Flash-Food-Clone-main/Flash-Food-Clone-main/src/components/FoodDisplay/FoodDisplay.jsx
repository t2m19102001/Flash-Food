import React, { useContext } from "react";
import "./FoodDisplay.scss";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category }) => {
  const { food_list, search = "" } = useContext(StoreContext);

  // 1. Logic lọc danh sách món ăn
  const filteredList = food_list.filter((item) => {
    if (!item) return false;

    const itemName = item.name ? item.name.toLowerCase() : "";
    const searchTerm = search.toLowerCase().trim();
    
    // Ép kiểu ID về String để so sánh chuẩn
    const itemCategoryStr = String(item.category);
    const categoryStr = String(category);

    // LOGIC THÔNG MINH: 
    // - Nếu đang search: Chỉ cần tên món khớp với từ khóa (tìm toàn bộ menu)
    // - Nếu KHÔNG search: Lọc theo danh mục được chọn
    const matchesCategory = search.trim() !== "" || (category === "All" || itemCategoryStr === categoryStr);
    const matchesSearch = itemName.includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  // 2. Lấy danh sách món gợi ý (Ví dụ: 4 món đầu tiên) khi không tìm thấy kết quả
  const suggestedItems = food_list.slice(0, 4);

  return (
    <div className="food-display" id="food-display">
      <h2>{search ? `Kết quả tìm kiếm cho "${search}"` : "Các món ăn gần bạn nhất"}</h2>
      
      <div className="food-display-list">
        {filteredList.length > 0 ? (
          filteredList.map((item, index) => (
            <FoodItem
              key={index}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
            />
          ))
        ) : (
          // --- PHẦN KHI KHÔNG TÌM THẤY KẾT QUẢ ---
          <div className="no-results-section">
            <div className="no-results-message">
               <p>Rất tiếc Lâm ơi, Flash Food không tìm thấy món "<strong>{search}</strong>".</p>
               <small>Thử kiểm tra lại chính tả hoặc tìm bằng từ khóa khác xem sao nhé!</small>
            </div>
            
            {/* HIỂN THỊ MÓN ĂN GỢI Ý */}
            <div className="food-suggestions">
               <h3 className="suggestion-title">Có thể Lâm sẽ thích những món này:</h3>
               <div className="food-display-list">
                  {suggestedItems.map((item, index) => (
                    <FoodItem
                      key={index}
                      id={item._id}
                      name={item.name}
                      description={item.description}
                      price={item.price}
                      image={item.image}
                    />
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDisplay;