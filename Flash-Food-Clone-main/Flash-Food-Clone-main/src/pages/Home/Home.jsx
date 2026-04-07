 
import Header from '../../components/Header/Header';
import './Home.scss'
import Menu from '../../components/ExploreMenu/Menu';
import { useState } from 'react';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';



const Home = () => {
  const [category,setCategory]=useState("All")
  return (
    <div>
        <Header/>
        <Menu category={category} setCategory={setCategory}/>
        <FoodDisplay category={category}/>
       
    </div>
  )
};

export default Home;
