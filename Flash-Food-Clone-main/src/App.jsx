  
import { Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar/Navbar"
import Home from "./pages/Home/Home"
import Cart from "./pages/Cart/Cart"
import Order from "./pages/Order/Order"
import MyOrders from "./pages/MyOrders/MyOrders"
import Footer from "./components/Footer/Footer"
import Login from "./components/Login/Login"
import Profile from './components/Profile/Profile'
import FoodDetail from './components/Product/FoodDetail';


import { useState } from "react"

const App = () => {

  const [showLogin,setShowLogin]= useState(false)

  return (
    <>
    {showLogin?<Login setShowLogin={setShowLogin}/>:<></>}
    
    <div className='app'>
    <Navbar setShowLogin={setShowLogin}/>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/cart' element={<Cart/>}/>
      <Route path='/order' element={<Order/>}/>
      <Route path='/myorders' element={<MyOrders/>}/>
      <Route path='/profile' element={<Profile />} />
      <Route path='/product/:foodId' element={<FoodDetail />} />
    </Routes>
    </div>
    <Footer/>
    </>
  )
}

export default App