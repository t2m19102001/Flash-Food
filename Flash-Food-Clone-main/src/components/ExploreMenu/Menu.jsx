import { useContext } from 'react'
import './Menu.scss'
import { menu_list } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'

const Menu = ({ category, setCategory }) => {

  const { food_list } = useContext(StoreContext)

  // Lấy danh sách category từ food_list thực tế
  const categories = [...new Set(food_list.map(f => f.category))]

  // Chia categories thành 2 nửa đều nhau
  const half = Math.ceil(categories.length / 2)
  const firstRow = categories.slice(0, half)
  const secondRow = categories.slice(half)

  // Map tên category với ảnh từ menu_list tĩnh
  const getCategoryImage = (catName) => {
    const match = menu_list.find(m =>
      catName.toLowerCase().includes(m.menu_name.toLowerCase()) ||
      m.menu_name.toLowerCase().includes(catName.toLowerCase())
    )
    return match ? match.menu_image : menu_list[0]?.menu_image
  }

  // Lấy icon cho từng category
  const getCategoryIcon = (catName) => {
    const icons = {
      'Cơm Tấm': '🍚',
      'Bánh Mì': '🥖',
      'Hải Sản': '🦐',
      'Ăn Vặt': '🍿',
      'Bánh Giò': '🥟',
      'Bún Riêu': '🍜',
      'Cà Phê': '☕',
      'Lẩu': '🍲',
      'Sinh Tố': '🥤',
      'Nước Ép': '🧃',
      'Sáng': '🌅',
      'Trà Sữa': '🧋',
      'Tối': '🌙',
      'Trưa': '☀️',
      'Xôi Mận': '🍚'
    }
    return icons[catName] || '🍽️'
  }

  const handleCategoryClick = (catName) => {
    setCategory(prev => prev === catName ? "All" : catName)
  }

  // Render một hàng
  const renderRow = (rowCategories, rowIndex) => (
    <div className="menu-row" key={rowIndex}>
      {rowCategories.map((catName, idx) => {
        const isActive = category === catName
        return (
          <div 
            onClick={() => handleCategoryClick(catName)} 
            key={idx} 
            className={`expl-menu-list-item ${isActive ? 'active' : ''}`}
          >
            <div className="menu-item-image-wrapper">
              <img 
                className={isActive ? "active" : ""} 
                src={getCategoryImage(catName)} 
                alt={catName}
              />
              <span className="menu-item-emoji">{getCategoryIcon(catName)}</span>
            </div>
            <p className="menu-item-name">{catName}</p>
            {isActive && <div className="active-indicator"></div>}
          </div>
        )
      })}
    </div>
  )

  return (
    <div className='expl-menu' id='expl-menu'>
      <div className="menu-header">
        <h1 className="menu-title">
          <span className="title-icon">🍽️</span>
          Khám phá thực đơn
        </h1>
        <p className="menu-subtitle">
          Chọn danh mục món ăn bạn yêu thích
        </p>
      </div>
      
      <div className="expl-menu-list">
        {/* HÀNG 1 */}
        {renderRow(firstRow, 0)}
        
        {/* HÀNG 2 - Chỉ hiển thị nếu có */}
        {secondRow.length > 0 && renderRow(secondRow, 1)}
      </div>
      
      <hr className="menu-divider" />
    </div>
  )
}

export default Menu