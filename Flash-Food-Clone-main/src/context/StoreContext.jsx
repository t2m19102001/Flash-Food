import { createContext, useEffect, useState } from "react"
import { food_list as static_food_list } from "../assets/assets"
import axios from "axios"

export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {

    const [food_list, setFoodList] = useState(static_food_list)
    const [cartItems, setCartItems] = useState({})
    const [token, setToken] = useState("")
    const [userName, setUserName] = useState("")
    const [promoCode, setPromoCode] = useState("")
    const [discount, setDiscount] = useState(0)

    const url = import.meta.env.VITE_API_URL || "http://localhost:4000"

    // Lấy danh sách sản phẩm từ API + map category name
    const fetchFoodList = async () => {
        try {
            const [foodRes, catRes] = await Promise.all([
                axios.get(`${url}/api/food/list`),
                axios.get(`${url}/api/category/list`)
            ])

            if (foodRes.data.success && foodRes.data.foods.length > 0) {
                // Build category map: id -> name
                const catMap = {}
                if (catRes.data.success) {
                    catRes.data.categories.forEach(cat => {
                        catMap[cat._id] = cat.name
                    })
                }

                const foods = foodRes.data.foods.map(food => ({
                    ...food,
                    image: food.image.startsWith("http") ? food.image : `${url}${food.image.startsWith("/") ? "" : "/"}${food.image}`,
                    // Nếu category là ObjectId, map sang tên
                    category: catMap[food.category] || food.category
                }))
                setFoodList(foods)
            }
        } catch (error) {
            // Nếu API lỗi, giữ data tĩnh làm fallback
            console.error("Error fetching food list, using static data")
        }
    }

    const addToCart = (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }))
        }
        else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))
        }
    }

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item)
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    }

    const logout = () => {
        setToken("")
        setUserName("")
        localStorage.removeItem("token")
        localStorage.removeItem("userName")
    }

    useEffect(() => {
        // Lấy sản phẩm từ API
        fetchFoodList()

        // Khôi phục token khi load trang
        const savedToken = localStorage.getItem("token")
        const savedName = localStorage.getItem("userName")
        if (savedToken) {
            setToken(savedToken)
            setUserName(savedName || "")
        }
    }, [])

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        userName,
        setUserName,
        logout,
        promoCode,
        setPromoCode,
        discount,
        setDiscount
    }
    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )

}
export default StoreContextProvider;