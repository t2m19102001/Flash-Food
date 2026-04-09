import React, { useState, useEffect } from "react";
import "./Product.scss";
import axios from "axios";
import { toast } from "react-toastify";
import { getCookie } from "../../utils/cookieHelper";
import { SkeletonTable, LoadingOverlay } from "../../components/Loading/Loading";
import {
    FormInput,
    FormSelect,
    FileUpload,
    FormActions,
    useFormValidation
} from "../../components/FormComponents/FormComponents";
import { useNavigate } from "react-router-dom";

const Product = ({ url }) => {
    const [list, setList] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [image, setImage] = useState(false);
    const [currentImage, setCurrentImage] = useState(""); // Lưu URL ảnh hiện tại khi edit
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 40;
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState({
        name: "",
        description: "",
        category: "Ăn sáng",
        price: "",
        rating: "4.5",
        address: "",
    });
    const navigate = useNavigate();

    // Filter and search products
    const filteredProducts = list.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());

        // Map filter values to actual database categories
        const categoryMap = {
            'ansang': 'Sáng',
            'antrua': 'Trưa',
            'antoi': 'Tối',
            'anvat': 'Ăn Vặt',
            'banhgio': 'Bánh Giò',
            'banhmi': 'Bánh Mì',
            'bunrieu': 'Bún Riêu',
            'cafe': 'Cà Phê',
            'comtam': 'Cơm Tấm',
            'comvanphong': 'Cơm Văn Phòng',
            'hutieu': 'Hủ Tiếu',
            'lau': 'Lẩu',
            'nuocep': 'Nước Ép',
            'sinhto': 'Sinh Tố',
            'trasua': 'Trà Sữa',
            'xoiman': 'Xôi Mặn'
        };

        const expectedCategory = categoryMap[filterCategory] || filterCategory;
        const matchesCategory = filterCategory === "all" || product.category === expectedCategory;

        return matchesSearch && matchesCategory;
    });


    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const fetchList = async () => {
        const response = await axios.get(`${url}/api/food/list`);
        if (response.data.success) {
            setList(response.data.foods);
        } else {
            toast.error("Lỗi khi tải danh sách");
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

    const editFood = (item) => {
        setIsEditing(true);
        setEditingId(item._id);
        setData({
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            rating: item.rating || "4.5",
            address: item.address || ""
        });
        setImage(false);
        setCurrentImage(item.image); // Lưu URL ảnh hiện tại
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditingId(null);
        setData({
            name: "",
            description: "",
            category: "Ăn sáng",
            price: "",
            rating: "4.5",
            address: "",
        });
        setImage(false);
        setCurrentImage(""); // Reset ảnh hiện tại
        setShowAddForm(false);
    };

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
        const token = getCookie("adminToken");

        if (isEditing) {
            formData.append("id", editingId);
        }

        if (image) {
            formData.append("image", image);
        }

        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("category", data.category);
        formData.append("price", Number(data.price));
        formData.append("rating", Number(data.rating));
        formData.append("address", data.address);

        const endpoint = isEditing ? `${url}/api/food/update` : `${url}/api/food/add`;

        const response = await axios.post(endpoint, formData, {
            headers: {
                token: token
            }
        });

        if (response.data.success) {
            toast.success(isEditing ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!");
            setData({
                name: "",
                description: "",
                category: "Ăn sáng",
                price: "",
                rating: "4.5",
                address: "",
            });
            setImage(false);
            setCurrentImage(""); // Reset ảnh hiện tại
            setShowAddForm(false);
            setIsEditing(false);
            setEditingId(null);
            fetchList();
        } else {
            toast.error(response.data.message || "Có lỗi xảy ra, vui lòng thử lại!");
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <div className="product-page">
            <div className="product-header">
                <div>
                    <h2>Quản Lý Sản Phẩm</h2>
                </div>
                <div className="header-actions">
                    <div className="product-count">
                        <span>Tổng số: <strong>{list.length}</strong> sản phẩm</span>
                    </div>
                    <button className="add-product-btn" onClick={() => {
                        if (isEditing) {
                            cancelEdit();
                        } else {
                            setShowAddForm(!showAddForm);
                        }
                    }}>
                        {showAddForm ? "Hủy" : "Thêm Sản Phẩm"}
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
                            placeholder="Tìm..."
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
                            <option value="all">▼ Danh mục</option>
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
                        <button className="toolbar-btn" onClick={fetchList} title="Làm mới">
                            🔄
                        </button>
                    </div>
                </div>
                <div className="toolbar-right">
                    <div className="pagination-info">
                        {filteredProducts.length > 0 ? `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredProducts.length)} / ${filteredProducts.length}` : '0 / 0'}
                    </div>
                    <button
                        className="toolbar-btn"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        ◀
                    </button>
                    <button
                        className="toolbar-btn"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        ▶
                    </button>
                </div>
            </div>

            {showAddForm && (
                <form className="add-product-form" onSubmit={onSubmitHandler}>
                    <h3>{isEditing ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}</h3>
                    <div className="form-grid">
                        <div className="form-col">
                            <div className="form-group">
                                <label>Hình ảnh</label>
                                <label htmlFor="image" className="image-upload-box">
                                    <img
                                        preview={
                                            image
                                                ? URL.createObjectURL(image)
                                                : (isEditing && currentImage)
                                                    ? `${url}/images/${currentImage}`
                                                    : "Chọn ảnh sản phẩm"
                                        }
                                        alt="Upload"
                                    />
                                </label>
                                <input
                                    type="file"
                                    id="image"
                                    onChange={(e) => setImage(e.target.files[0])}
                                    hidden
                                    required={!isEditing}
                                />
                            </div>
                        </div>
                        <div className="form-col"></div>
                        <div className="form-col">
                            <div className="form-group">
                                <label>Tên sản phẩm</label>
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
                                <label>Danh mục</label>
                                <select onChange={onChangeHandler} name="category" value={data.category}>
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
                        <div className="form-col">
                            <div className="form-group">
                                <label>Giá bán</label>
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
                                <label>Mô tả</label>
                                <textarea
                                    name="description"
                                    value={data.description}
                                    onChange={onChangeHandler}
                                    rows="2"
                                    placeholder="Viết mô tả sản phẩm..."
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label>Đánh giá (1-5)</label>
                                <input
                                    type="number"
                                    name="rating"
                                    value={data.rating}
                                    onChange={onChangeHandler}
                                    min="1"
                                    max="5"
                                    step="0.1"
                                    placeholder="4.5"
                                />
                            </div>
                            <div className="form-group">
                                <label>Địa chỉ</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={data.address}
                                    onChange={onChangeHandler}
                                    placeholder="Nhập địa chỉ..."
                                />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="submit-btn">
                        {isEditing ? "Cập Nhật Sản Phẩm" : "Thêm Sản Phẩm"}
                    </button>
                </form>
            )}

            <div className="product-table">
                <div className="product-table-format title">
                    <b>Hình Ảnh</b>
                    <b>Tên Sản Phẩm</b>
                    <b>Danh Mục</b>
                    <b>Giá</b>
                    <b>Thao Tác</b>
                </div>
                {currentProducts.length > 0 ? (
                    currentProducts.map((item, index) => (
                        <div key={index} className="product-table-format">
                            <img src={`${url}` + item.image} alt="" />
                            <p className="product-name">{item.name}</p>
                            <span className="category-badge">{item.category}</span>
                            <p className="product-price">{item.price.toLocaleString()} đ</p>
                            <div className="action-buttons">
                                <button className="edit-btn" onClick={() => editFood(item)}>
                                    Sửa
                                </button>
                                <button className="delete-btn" onClick={() => removeFood(item._id)}>
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <p>📦 Chưa có sản phẩm nào!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Product;
