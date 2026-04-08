import { createContext, useEffect, useState } from "react";
import { food_list as static_food_list } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [food_list, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [search, setSearch] = useState("");

  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const cleanUrl = url.endsWith("/") ? url.slice(0, -1) : url;
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${cleanUrl}${cleanPath}`;
  };

  const fetchFoodList = async () => {
    try {
      const [foodRes, catRes] = await Promise.all([
        axios.get(`${url}/api/food/list`),
        axios.get(`${url}/api/category/list`),
      ]);

      if (foodRes.data.success) {
        const catMap = {};
        if (catRes.data.success) {
          catRes.data.categories.forEach((cat) => {
            catMap[cat._id] = cat.name;
          });
        }

        const foods = foodRes.data.foods.map((food) => ({
          ...food,
          image: getImageUrl(food.image),
          category: catMap[food.category] || food.category,
        }));
        setFoodList(foods);
      } else {
        setFoodList(static_food_list);
      }
    } catch (error) {
      console.error("Lỗi fetch data, đang dùng dữ liệu tĩnh:", error);
      setFoodList(static_food_list);
    }
  };

  const addToCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  // 1. MỚI: Hàm tính tổng SỐ LƯỢNG món để hiện badge trên Navbar
  const getTotalCartItems = () => {
    let totalItems = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItems += cartItems[item];
      }
    }
    return totalItems;
  };

  // 2. CẬP NHẬT: Tính tổng tiền (có trừ đi discount nếu có)
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find(
          (product) => String(product._id) === String(item),
        );
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    // Trả về tổng tiền sau khi giảm giá (đảm bảo không âm)
    return Math.max(0, totalAmount - discount);
  };

  const logout = () => {
    setToken("");
    setUserName("");
    setUserImage("");
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userImage");
    setCartItems({});
  };

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        setUserName(localStorage.getItem("userName") || "");
        setUserImage(localStorage.getItem("userImage") || "");
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems, // 3. Đưa hàm mới vào context
    url,
    token,
    setToken,
    userName,
    setUserName,
    userImage,
    setUserImage,
    logout,
    promoCode,
    setPromoCode,
    discount,
    setDiscount,
    search,
    setSearch,
    getImageUrl,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
