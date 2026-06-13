import { createContext, useEffect, useState } from "react";
import { food_list as static_food_list } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [food_list, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";

  axios.defaults.withCredentials = true;
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  // 🔥 GIỮ NGUYÊN HÀM getImageUrl CŨ (KHÔNG SỬA)
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
      console.error("Lỗi fetch data:", error);
      setFoodList(static_food_list);
    }
  };

  const checkAuthStatus = async () => {
    setAuthLoading(true);
    try {
      const response = await axios.get(`${url}/api/user/check-auth`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setIsAuthenticated(true);
        setUserName(response.data.user.name);
        setUserId(response.data.user.id);
        
        // GIỮ NGUYÊN CÁCH LẤY ẢNH CŨ
        const imageUrl = response.data.user.image 
          ? (response.data.user.image.startsWith('http') 
              ? response.data.user.image 
              : `${url}/images/${response.data.user.image}`)
          : "";
        setUserImage(imageUrl);
        setIsAdmin(response.data.user.isAdmin || false);
        
        if (response.data.token) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        }
        
        localStorage.setItem("userName", response.data.user.name);
        localStorage.setItem("userId", response.data.user.id);
        if (imageUrl) localStorage.setItem("userImage", imageUrl);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUserName("");
      setUserImage("");
      setUserId(null);
    } finally {
      setAuthLoading(false);
      setLoading(false);
    }
  };

  // 🔥 ĐĂNG NHẬP - GIỮ NGUYÊN
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${url}/api/user/login`, {
        email,
        password
      }, { withCredentials: true });
      
      if (response.data.success) {
        setIsAuthenticated(true);
        setUserName(response.data.name);
        setUserId(response.data.userId);
        
        if (response.data.token) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        }
        
        // GIỮ NGUYÊN CÁCH LẤY ẢNH CŨ
        const imageUrl = response.data.image 
          ? (response.data.image.startsWith('http') 
              ? response.data.image 
              : `${url}/images/${response.data.image}`)
          : "";
        setUserImage(imageUrl);
        setIsAdmin(response.data.isAdmin || false);
        
        localStorage.setItem("userName", response.data.name);
        localStorage.setItem("userId", response.data.userId);
        if (imageUrl) localStorage.setItem("userImage", imageUrl);
        
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Lỗi kết nối" };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${url}/api/user/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsAuthenticated(false);
      setUserName("");
      setUserImage("");
      setIsAdmin(false);
      setUserId(null);
      setToken(null);
      setCartItems({});
      setPromoCode("");
      setDiscount(0);
      setSearch("");
      
      localStorage.removeItem("userName");
      localStorage.removeItem("userImage");
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      sessionStorage.clear();
    }
  };

  const updateUserImage = (imageUrl) => {
    setUserImage(imageUrl);
    if (imageUrl) {
      localStorage.setItem("userImage", imageUrl);
    } else {
      localStorage.removeItem("userImage");
    }
  };

  const updateUserName = (name) => {
    setUserName(name);
    localStorage.setItem("userName", name);
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

  const getTotalCartItems = () => {
    let totalItems = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItems += cartItems[item];
      }
    }
    return totalItems;
  };

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
    return Math.max(0, totalAmount - discount);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
    
    const init = async () => {
      await fetchFoodList();
      await checkAuthStatus();
    };
    init();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
    url,
    isAuthenticated,
    userName,
    setUserName: updateUserName,
    userImage,
    setUserImage: updateUserImage,
    isAdmin,
    userId,
    token,
    login,
    logout,
    promoCode,
    setPromoCode,
    discount,
    setDiscount,
    search,
    setSearch,
    getImageUrl,
    selectedCategory,
    setSelectedCategory,
    loading: loading || authLoading,
    authLoading
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;