import { useContext } from 'react'
import './Menu.scss'
import { menu_list } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'

const Menu = ({ category, setCategory }) => {

  const { food_list } = useContext(StoreContext)

  // Lấy danh sách category từ food_list thực tế
  const categories = [...new Set(food_list.map(f => f.category))]

  // Map tên category với ảnh từ menu_list tĩnh
  const getCategoryImage = (catName) => {
    const match = menu_list.find(m =>
      catName.toLowerCase().includes(m.menu_name.toLowerCase()) ||
      m.menu_name.toLowerCase().includes(catName.toLowerCase())
    )
    return match ? match.menu_image : menu_list[0]?.menu_image
  }

  return (
    <div className='expl-menu' id='expl-menu'>
      <h1>Khám phá thực đơn</h1>
      <div className="expl-menu-list">
        {categories.map((catName, index) => {
          return (
            <div onClick={() => setCategory(prev => prev === catName ? "All" : catName)} key={index} className='expl-menu-list-item'>
              <img className={category === catName ? "active" : ""} src={getCategoryImage(catName)} />
              <p>{catName}</p>
            </div>
          )
        })}
      </div>
      <hr />
    </div>
  )
}

export default Menu


