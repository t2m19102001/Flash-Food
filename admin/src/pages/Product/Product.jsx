import React, { useState, useEffect } from "react";
import "./Product.scss";
import axios from "axios";
import { toast } from "react-toastify";

const Product = ({ url }) => {
  const [list, setList] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    category: "ansang",
    price: "",
  });

  // Categories mapping
  const categories = [
    { value: "ansang", label: "Ăn sáng" },
    { value: "antrua", label: "Ăn trưa" },
    { value: "antoi", label: "Ăn tối" },
    { value: "anvat", label: "Ăn vặt" },
    { value: "banhgio", label: "Bánh giò" },
    { value: "banhmi", label: "Bánh mì" },
    { value: "bunrieu", label: "Bún riêu" },
    { value: "cafe", label: "Cà phê" },
    { value: "comtam", label: "Cơm tấm" },
    { value: "comvanphong", label: "Cơm văn phòng" },
    { value: "hutieu", label: "Hủ tiếu" },
    { value: "lau", label: "Lẩu" },
    { value: "nuocep", label: "Nước ép" },
    { value: "sinhto", label: "Sinh tố" },
    { value: "trasua", label: "Trà sữa" },
    { value: "xoiman", label: "Xôi mặn" },
  ];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;

    // 🔥 Nếu đường dẫn đã bắt đầu bằng /uploads/ (từ database)
    if (imagePath.startsWith("/uploads/")) {
      return `${url}${imagePath}`;
    }

    // Nếu imagePath có chứa thư mục con (ví dụ: anvat/ten_file.jpg)
    if (imagePath.includes("/")) {
      return `${url}/uploads/${imagePath}`;
    }

    // Nếu chỉ có tên file, lấy từ thư mục images
    return `${url}/images/${imagePath}`;
  };

  // Filter products
  const filteredProducts = list.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const categoryMap = {
      ansang: "Sáng",
      antrua: "Trưa",
      antoi: "Tối",
      anvat: "Ăn Vặt",
      banhgio: "Bánh Giò",
      banhmi: "Bánh Mì",
      bunrieu: "Bún Riêu",
      cafe: "Cà Phê",
      comtam: "Cơm Tấm",
      comvanphong: "Cơm Văn Phòng",
      hutieu: "Hủ Tiếu",
      lau: "Lẩu",
      nuocep: "Nước Ép",
      sinhto: "Sinh Tố",
      trasua: "Trà Sữa",
      xoiman: "Xôi Mặn",
    };

    const expectedCategory = categoryMap[filterCategory] || filterCategory;
    const matchesCategory =
      filterCategory === "all" || product.category === expectedCategory;

    return matchesSearch && matchesCategory;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/food/list`, {
        withCredentials: true,
      });
      if (response.data.success) {
        console.log("📦 Danh sách sản phẩm:", response.data.foods);
        setList(response.data.foods);
      } else {
        toast.error("Lỗi khi tải danh sách");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const removeFood = async (foodId) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      const response = await axios.post(
        `${url}/api/food/remove`,
        { id: foodId },
        {
          withCredentials: true,
        },
      );
      if (response.data.success) {
        toast.success("Xóa sản phẩm thành công");
        fetchList();
      } else {
        toast.error(response.data.message || "Lỗi khi xóa sản phẩm");
      }
    } catch (error) {
      console.error("Remove error:", error);
      toast.error(error.response?.data?.message || "Lỗi khi xóa sản phẩm");
    }
  };

  const editFood = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    setData({
      name: item.name,
      description: item.description,
      category:
        item.category === "Sáng"
          ? "ansang"
          : item.category === "Trưa"
            ? "antrua"
            : item.category === "Tối"
              ? "antoi"
              : "ansang",
      price: item.price,
    });
    setCurrentImage(item.image);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setData({ name: "", description: "", category: "ansang", price: "" });
    setImage(null);
    setCurrentImage("");
    setShowAddForm(false);
  };

  const onChangeHandler = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!isEditing && !image) {
      toast.error("Vui lòng chọn ảnh sản phẩm!");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();

    if (isEditing) formData.append("id", editingId);
    if (image) formData.append("image", image);
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("price", Number(data.price));

    try {
      const endpoint = isEditing
        ? `${url}/api/food/update`
        : `${url}/api/food/add`;
      const response = await axios.post(endpoint, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success(
          isEditing
            ? "Cập nhật sản phẩm thành công!"
            : "Thêm sản phẩm thành công!",
        );
        setData({ name: "", description: "", category: "ansang", price: "" });
        setImage(null);
        setCurrentImage("");
        setShowAddForm(false);
        setIsEditing(false);
        setEditingId(null);
        fetchList();
      } else {
        toast.error(
          response.data.message || "Có lỗi xảy ra, vui lòng thử lại!",
        );
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.message || "Lỗi khi lưu sản phẩm");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="product-page">
      <div className="product-header">
        <div>
          <h2>📦 Quản Lý Sản Phẩm</h2>
          <p className="subtitle">Thêm, sửa, xóa và quản lý danh sách món ăn</p>
        </div>
        <div className="header-actions">
          <div className="product-count">
            <span>
              📊 Tổng số: <strong>{list.length}</strong> sản phẩm
            </span>
          </div>
          <button
            className={`add-product-btn ${showAddForm ? "active" : ""}`}
            onClick={() => {
              if (isEditing) cancelEdit();
              else setShowAddForm(!showAddForm);
            }}
          >
            {showAddForm ? "✖ Hủy" : "➕ Thêm Sản Phẩm"}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="filter-group">
            <select
              className="filter-dropdown"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">📋 Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <button className="toolbar-btn" onClick={fetchList} title="Làm mới">
              🔄
            </button>
          </div>
        </div>
        <div className="toolbar-right">
          <div className="pagination-info">
            {filteredProducts.length > 0
              ? `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredProducts.length)} / ${filteredProducts.length}`
              : "0 / 0"}
          </div>
          <button
            className="toolbar-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ◀
          </button>
          <button
            className="toolbar-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            ▶
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <form className="add-product-form" onSubmit={onSubmitHandler}>
          <h3>
            {isEditing ? "✏️ Chỉnh Sửa Sản Phẩm" : "✨ Thêm Sản Phẩm Mới"}
          </h3>
          <div className="form-grid">
            <div className="form-col image-col">
              <div className="form-group">
                <label>📷 Hình ảnh {!isEditing && "*"}</label>
                <label htmlFor="image" className="image-upload-box">
                  {image || currentImage ? (
                    <img
                      src={
                        image
                          ? URL.createObjectURL(image)
                          : getImageUrl(currentImage)
                      }
                      alt="Preview"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8.5" cy="8.5" r="2.5"/><path d="M21 15l-5-4-3 3-4-4-5 5"/></svg>';
                      }}
                    />
                  ) : (
                    <div className="upload-placeholder">
                      <span>📸</span>
                      <p>Chọn ảnh sản phẩm</p>
                    </div>
                  )}
                </label>
                <input
                  type="file"
                  id="image"
                  onChange={(e) => setImage(e.target.files[0])}
                  hidden
                  accept="image/*"
                />
              </div>
            </div>
            <div className="form-col info-col">
              <div className="form-group">
                <label>🏷️ Tên sản phẩm *</label>
                <input
                  type="text"
                  name="name"
                  value={data.name}
                  onChange={onChangeHandler}
                  placeholder="Nhập tên sản phẩm"
                  required
                />
              </div>
              <div className="form-group">
                <label>📂 Danh mục *</label>
                <select
                  name="category"
                  value={data.category}
                  onChange={onChangeHandler}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>💰 Giá bán (VNĐ) *</label>
                <input
                  type="number"
                  name="price"
                  value={data.price}
                  onChange={onChangeHandler}
                  placeholder="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>📝 Mô tả</label>
                <textarea
                  name="description"
                  value={data.description}
                  onChange={onChangeHandler}
                  rows="3"
                  placeholder="Mô tả sản phẩm..."
                ></textarea>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting
                ? "Đang xử lý..."
                : isEditing
                  ? "💾 Cập Nhật"
                  : "➕ Thêm Mới"}
            </button>
            <button type="button" className="cancel-btn" onClick={cancelEdit}>
              ❌ Hủy
            </button>
          </div>
        </form>
      )}

      {/* Product Table */}
      <div className="product-table">
        <div className="product-table-format title">
          <b>📷 Hình Ảnh</b>
          <b>🏷️ Tên Sản Phẩm</b>
          <b>📂 Danh Mục</b>
          <b>💰 Giá</b>
          <b>⚙️ Thao Tác</b>
        </div>
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : currentProducts.length > 0 ? (
          currentProducts.map((item, index) => {
            const imageUrl = getImageUrl(item.image);
            return (
              <div key={index} className="product-table-format">
                <img
                  src={imageUrl}
                  alt={item.name}
                  style={{
                    width: "55px",
                    height: "55px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                  onError={(e) => {
                    console.warn(`⚠️ Không tìm thấy ảnh: ${imageUrl}`);
                    e.target.onerror = null;
                    e.target.src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8.5" cy="8.5" r="2.5"/><path d="M21 15l-5-4-3 3-4-4-5 5"/></svg>';
                  }}
                />
                <p className="product-name">{item.name}</p>
                <span className="category-badge">{item.category}</span>
                <p className="product-price">{item.price.toLocaleString()}đ</p>
                <div className="action-buttons">
                  <button className="edit-btn" onClick={() => editFood(item)}>
                    ✏️ Sửa
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => removeFood(item._id)}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>Chưa có sản phẩm nào!</p>
            <button
              className="add-first-btn"
              onClick={() => setShowAddForm(true)}
            >
              ➕ Thêm sản phẩm đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
