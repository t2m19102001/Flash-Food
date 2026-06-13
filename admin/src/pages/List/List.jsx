import React, { useState } from "react";
import "./List.scss";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { getCookie } from "../../utils/cookieHelper";

const List = ({ url }) => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/food/list`);
    if (response.data.success) {
      setList(response.data.foods);
    } else {
      toast.error("Error");
    }
  };
  const removeFood = async (foodId) => {
    const token = getCookie("adminToken");
    const response = await axios.post(`${url}/api/food/remove`, { id: foodId }, {
      headers: {
        token: token
      }
    });
    await fetchList();
    if (response.data.success) {
      toast.success("Xóa sản phẩm thành công");
    } else {
      toast.error(response.data.message || "Lỗi khi xóa sản phẩm");
    }
  };


  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2>🍴 Danh Sách Sản Phẩm</h2>
          <p className="subtitle">Quản lý tất cả các món ăn trong hệ thống</p>
        </div>
        <div className="list-count">
          <span>Tổng số: <strong>{list.length}</strong> sản phẩm</span>
        </div>
      </div>

      <div className="list-table">
        <div className="list-table-format title">
          <b>Hình Ảnh</b>
          <b>Tên Sản Phẩm</b>
          <b>Danh Mục</b>
          <b>Giá</b>
          <b>Thao Tác</b>
        </div>
        {list.length > 0 ? (
          list.map((item, index) => {
            return (
              <div key={index} className="list-table-format">
                <img src={`${url}` + item.image} alt="" />
                <p className="product-name">{item.name}</p>
                <span className="category-badge">{item.category}</span>
                <p className="product-price">{item.price.toLocaleString()} đ</p>
                <button className="delete-btn" onClick={() => removeFood(item._id)}>
                  <span>🗑️</span> Xóa
                </button>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <p>📦 Chưa có sản phẩm nào!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default List;
