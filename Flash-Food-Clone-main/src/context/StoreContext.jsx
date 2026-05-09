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
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // Cấu hình axios mặc định
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  // 🔥 Interceptor xử lý lỗi 401 - KHÔNG redirect tự động
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.log("🔐 Phiên đăng nhập hết hạn");
        // Không redirect tự động, để component tự xử lý
      }
      return Promise.reject(error);
    }
  );

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

  // 🔥 KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP (dùng cookie)
  const checkAuthStatus = async () => {
    setAuthLoading(true);
    try {
      const response = await axios.get(`${url}/api/user/check-auth`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setIsAuthenticated(true);
        setUserName(response.data.user.name);
        const imageUrl = response.data.user.image 
          ? (response.data.user.image.startsWith('http') 
              ? response.data.user.image 
              : `${url}/images/${response.data.user.image}`)
          : "";
        setUserImage(imageUrl);
        setIsAdmin(response.data.user.isAdmin || false);
        console.log("✅ Đã đăng nhập với tài khoản:", response.data.user.name);
        
        // Lưu vào localStorage để fallback
        if (imageUrl) localStorage.setItem("userImage", imageUrl);
        localStorage.setItem("userName", response.data.user.name);
      } else {
        setIsAuthenticated(false);
        console.log("🔓 Chưa đăng nhập");
      }
    } catch (error) {
      console.log("🔓 Chưa đăng nhập hoặc phiên hết hạn");
      setIsAuthenticated(false);
      setUserName("");
      setUserImage("");
    } finally {
      setAuthLoading(false);
      setLoading(false);
    }
  };

  // 🔥 ĐĂNG NHẬP
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${url}/api/user/login`, {
        email,
        password
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setIsAuthenticated(true);
        setUserName(response.data.name);
        const imageUrl = response.data.image 
          ? (response.data.image.startsWith('http') 
              ? response.data.image 
              : `${url}/images/${response.data.image}`)
          : "";
        setUserImage(imageUrl);
        setIsAdmin(response.data.isAdmin || false);
        
        // Lưu thông tin vào localStorage
        localStorage.setItem("userName", response.data.name);
        if (imageUrl) localStorage.setItem("userImage", imageUrl);
        
        console.log("✅ Login thành công:", response.data.name);
        
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Lỗi kết nối đến máy chủ";
      
      if (error.response) {
        errorMessage = error.response.data?.message || "Sai email hoặc mật khẩu";
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  // 🔥 ĐĂNG XUẤT - XÓA TOÀN BỘ DỮ LIỆU
  const logout = async () => {
    try {
      await axios.post(`${url}/api/user/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Reset tất cả state
      setIsAuthenticated(false);
      setUserName("");
      setUserImage("");
      setIsAdmin(false);
      setCartItems({});
      setPromoCode("");
      setDiscount(0);
      setSearch("");
      
      // 🔥 XÓA TOÀN BỘ LOCALSTORAGE
      localStorage.removeItem("userName");
      localStorage.removeItem("userImage");
      
      // 🔥 XÓA SESSIONSTORAGE
      sessionStorage.clear();
      
      console.log("🚪 Đã đăng xuất, đã xóa toàn bộ dữ liệu lưu trữ");
    }
  };

  // 🔥 HÀM CẬP NHẬT USER IMAGE (gọi từ Profile)
  const updateUserImage = (imageUrl) => {
    console.log("🖼️ Cập nhật user image:", imageUrl);
    setUserImage(imageUrl);
    if (imageUrl) {
      localStorage.setItem("userImage", imageUrl);
    } else {
      localStorage.removeItem("userImage");
    }
  };

  // 🔥 HÀM CẬP NHẬT USER NAME
  const updateUserName = (name) => {
    console.log("👤 Cập nhật user name:", name);
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

  // Load dữ liệu khi khởi động
  useEffect(() => {
    const init = async () => {
      await fetchFoodList();
      await checkAuthStatus();
    };
    init();
  }, []);

  // 🔥 CONTEXT VALUE - ĐẦY ĐỦ
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
    login,
    logout,
    promoCode,
    setPromoCode,
    discount,
    setDiscount,
    search,
    setSearch,
    getImageUrl,
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