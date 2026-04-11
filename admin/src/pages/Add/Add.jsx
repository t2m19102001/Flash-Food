import React from "react";
import { assets } from "../../assets/assets";
import "./Add.scss";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getCookie } from "../../utils/cookieHelper";

const Add = ({ url }) => {

  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    category: "Ăn sáng",
    price: "",
  });
  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({
      ...data,
      [name]: value,
    }));
  };
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("image", image);
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("price", Number(data.price));

    const token = getCookie("adminToken");
    const response = await axios.post(`${url}/api/food/add`, formData, {
      headers: {
        token: token
      }
    });

    if (response.data.success) {
      toast.success("Thêm sản phẩm thành công!");
      setData({
        name: "",
        description: "",
        category: "Ăn sáng",
        price: "",
      });
      setImage(false);
    } else {
      toast.error(response.data.message || "Có lỗi xảy ra, vui lòng thử lại!");
    }
  };
  return (
    <div className="add">
      {/* Header với tiêu đề sản phẩm */}
      <div className="add-header">
        <div className="header-content">
          <div className="add-title-section">
            <label className="title-label">Tên sản phẩm ?</label>
            <div className="add-title">
              <input
                type="text"
                className="product-title-input"
                placeholder="Nhập tên sản phẩm"
                value={data.name}
                onChange={onChangeHandler}
                name="name"
              />
            </div>
          </div>
          <div className="image-section">
            <label htmlFor="image" className="image-upload">
              <img
                src={image ? URL.createObjectURL(image) : assets.upload_area}
                alt="Upload"
              />
            </label>
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="image"
              hidden
              required
            />
          </div>
        </div>

        {/* Tab menu */}
        <div className="add-tabs">
          <button type="button" className="tab active">Thông tin chung</button>
        </div>
        <form className="add-form" onSubmit={onSubmitHandler}>
          {/* Layout 2 cột */}
          <div className="form-layout">
            {/* Cột trái - Thông tin sản phẩm */}
            <div className="form-left">
              <div className="form-group">
                <label>Product Type</label>
                <select onChange={onChangeHandler} name="category">
                  <option value="ansang">Ăn sáng</option>
                  <option value="antrua">Ăn trưa</option>
                  <option value="antoi">Ăn tối</option>
                  <option value="anvat">Ăn vặt</option>
                  <option value="banhgio">Bánh giò</option>
                  <option value="banhmi">Bánh mì</option>
                  <option value="bunrieu">Bún riêu</option>
                  <option value="cafe">Cafe</option>
                  <option value="comtam">Cơm tấm</option>
                  <option value="comvanphong">Cơm văn phòng</option>
                  <option value="hutieu">Hủ tiếu</option>
                  <option value="lau">Lẩu</option>
                  <option value="nuocep">Nước ép</option>
                  <option value="sinhto">Sinh tố</option>
                  <option value="trasua">Trà sữa</option>
                  <option value="xoiman">Xôi mặn</option>
                </select>
              </div>
            </div>

            {/* Cột phải - Giá và hình ảnh */}
            <div className="form-right">
              <div className="form-group">
                <label>Giá bán</label>
                <input
                  onChange={onChangeHandler}
                  value={data.price}
                  type="number"
                  name="price"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Mô tả sản phẩm */}
          <div className="form-group full-width">
            <label>Mô tả sản phẩm</label>
            <textarea
              onChange={onChangeHandler}
              value={data.description}
              name="description"
              rows="4"
              placeholder="Viết mô tả sản phẩm..."
            ></textarea>
          </div>

          <button type="submit" className="add-btn">
            Thêm sản phẩm
          </button>
        </form>
      </div>


    </div>
  );
};
export default Add;
