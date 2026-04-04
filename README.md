# 🍔 Flash-Food - Food Delivery Platform

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-green)]()
[![React Version](https://img.shields.io/badge/React-18%2B%20%26%2019%2B-61DAFB?logo=react)]()

Một nền tảng giao đồ ăn đầy đủ được xây dựng với công nghệ hiện đại, cung cấp trải nghiệm mua sắm, thanh toán và quản lý đơn hàng an toàn và hiệu quả.

> **Dự án học tập** - Công nghệ Phần Mềm

## 📋 Mục Lục

- [Tính Năng](#-tính-năng)
- [Kiến Trúc](#-kiến-trúc)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Cài Đặt & Chạy](#-cài-đặt--chạy)
- [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [API Endpoints](#-api-endpoints)
- [Các Biến Môi Trường](#-các-biến-môi-trường)
- [Tài Khoản Demo](#-tài-khoản-demo)
- [Liên Hệ & Hỗ Trợ](#-liên-hệ--hỗ-trợ)

---

## 🎯 Tính Năng

### 👥 Dành Cho Khách Hàng (Customer)
- ✅ **Khám phá thực đơn** - Duyệt các món ăn theo danh mục
- ✅ **Giỏ hàng thông minh** - Quản lý đơn hàng trước khi thanh toán
- ✅ **Thanh toán An Toàn** - Tích hợp Stripe Payment Gateway
- ✅ **Theo dõi đơn hàng** - Xem trạng thái đơn hàng real-time (SSE)
- ✅ **Viết đánh giá** - Đánh giá và bình luận về công ty cũng như các món ăn
- ✅ **Mã khuyến mãi** - Áp dụng code giảm giá khi thanh toán
- ✅ **Xác thực người dùng** - Đăng ký, đăng nhập với JWT
- ✅ **Hồ sơ cá nhân** - Quản lý thông tin tài khoản

### 🛠️ Dành Cho Quản Trị Viên (Admin)
- ✅ **Dashboard phân tích** - Thống kê doanh số, đơn hàng, người dùng
- ✅ **Quản lý sản phẩm** - Thêm, sửa, xóa, tìm kiếm món ăn
- ✅ **Quản lý danh mục** - Quản lý các loại món ăn
- ✅ **Quản lý đơn hàng** - Cập nhật trạng thái đơn hàng, gửi thông báo real-time
- ✅ **Quản lý người dùng** - Xem danh sách khách hàng, quản lý tài khoản
- ✅ **Quản lý đánh giá** - Xem và xử lý các bình luận từ khách hàng
- ✅ **Quản lý khuyến mãi** - Tạo và quản lý mã giảm giá
- ✅ **Tải file** - Hỗ trợ upload ảnh sản phẩm
- ✅ **Thông báo Real-time** - Nhận thông báo khi có đơn hàng mới

---

## 🏗️ Kiến Trúc

```
Flash-Food (Monorepo)
├── Flash-Food-Clone-BackEnd/     # Backend API (Node.js + Express + MongoDB)
├── Flash-Food-Clone-main/        # Frontend (React + Vite) - Customer
├── admin/                        # Admin Panel (React + Vite)
└── README.md
```

### Cấu Trúc Dự Án

#### **Backend** (`Flash-Food-Clone-BackEnd/`)
```
Flash-Food-Clone-BackEnd/
├── server.js                     # Entry point
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/                 # Business logic
│   ├── foodController.js
│   ├── userController.js
│   ├── orderController.js
│   ├── paymentController.js
│   ├── reviewController.js
│   ├── categoryController.js
│   ├── promoController.js
│   └── statsController.js
├── models/                      # MongoDB schemas
│   ├── foodModel.js
│   ├── userModel.js
│   ├── orderModel.js
│   ├── reviewModel.js
│   ├── categoryModel.js
│   └── promoModel.js
├── routers/                     # API routes
│   ├── foodRouter.js
│   ├── userRoute.js
│   ├── orderRouter.js
│   ├── paymentRouter.js
│   ├── reviewRouter.js
│   ├── categoryRouter.js
│   ├── promoRouter.js
│   └── statsRoute.js
├── middleware/                  # Middleware
│   ├── auth.js                 # JWT authentication
│   ├── cache.js                # Caching
│   ├── security.js             # CORS, rate limiting, input validation
│   └── upload.js               # File upload handling
├── uploads/                    # Stored images by category
└── package.json
```

#### **Frontend** (`Flash-Food-Clone-main/`)
```
Flash-Food-Clone-main/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── App.css
│   ├── pages/
│   │   ├── Home/               # Trang chủ
│   │   ├── Cart/               # Giỏ hàng
│   │   ├── Order/              # Đặt hàng
│   │   └── MyOrders/           # Đơn hàng của tôi
│   ├── components/             # Reusable components
│   │   ├── Navbar/
│   │   ├── Footer/
│   │   ├── FoodItem/
│   │   ├── FoodDisplay/
│   │   ├── ExploreMenu/
│   │   └── Login/
│   ├── context/                # Global state management
│   ├── assets/                 # Food images by category
│   └── index.css
└── package.json
```

#### **Admin Panel** (`admin/`)
```
admin/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── pages/
│   │   ├── Add/                # Thêm sản phẩm
│   │   ├── List/               # Danh sách sản phẩm
│   │   ├── Orders/             # Quản lý đơn hàng
│   │   ├── Product/            # Chi tiết sản phẩm
│   │   ├── Review/             # Đánh giá
│   │   └── User/               # Quản lý người dùng
│   ├── components/
│   │   ├── Navbar/
│   │   ├── Sidebar/
│   │   ├── Dashboard/          # Analytics
│   │   ├── FormComponents/
│   │   ├── Loading/
│   │   ├── Notifications/
│   │   ├── OrderStatusNotifications/
│   │   ├── PaymentForm/        # Stripe payment form
│   │   └── Login/
│   ├── store/                  # Redux or Context
│   ├── themes/
│   ├── utils/
│   │   ├── cookieHelper.js
│   │   ├── notificationService.js
│   │   ├── orderStatusService.js
│   │   ├── stripeService.js
│   │   └── apiClient.js
│   └── assets/
└── package.json
```

---

## 💾 Cấu Trúc Dữ Liệu

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  image: String,
  cartData: Object,
  isAdmin: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Food Schema
```javascript
{
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  isAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  userId: ObjectId,
  items: Array,
  amount: Number,
  address: Object,
  status: String (Pending/Confirmed/Preparing/Out for delivery/Delivered),
  date: Date,
  payment: Boolean,
  promoCode: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🛠️ Yêu Cầu Hệ Thống

- **Node.js**: v18.0 hoặc cao hơn
- **npm**: v9.0 hoặc cao hơn
- **MongoDB**: v4.4 hoặc cao hơn (hoặc MongoDB Atlas cloud)
- **Git**: Để clone repository

### Tài Khoản Bên Thứ Ba
- **Stripe Account**: Để xử lý thanh toán
- **MongoDB Atlas**: Để quản lý database (tùy chọn)

---

## 🚀 Cài Đặt & Chạy

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/Flash-Food.git
cd Flash-Food
```

### 2. Cài Đặt Backend
```bash
cd Flash-Food-Clone-BackEnd
npm install
```

**Tạo file `.env` trong thư mục Backend:**
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/flash-food
# Hoặc sử dụng MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flash-food

JWT_SECRET=your_jwt_secret_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
NODE_ENV=development
```

**Chạy Backend:**
```bash
npm run dev
# hoặc
npm run server
```

Backend sẽ chạy tại: **http://localhost:4000**

---

### 3. Cài Đặt Frontend (Customer)
```bash
cd Flash-Food-Clone-main
npm install
```

**Tạo file `.env` trong thư mục Frontend:**
```env
VITE_API_URL=http://localhost:4000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key_here
```

**Chạy Frontend:**
```bash
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

---

### 4. Cài Đặt Admin Panel
```bash
cd admin
npm install
```

**Tạo file `.env` trong thư mục Admin:**
```env
VITE_API_URL=http://localhost:4000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key_here
```

**Chạy Admin Panel:**
```bash
npm run dev
```

Admin Panel sẽ chạy tại: **http://localhost:5174** hoặc **http://localhost:5175**

---

### 5. Kết Nối MongoDB (Nếu sử dụng local)
```bash
# Nếu MongoDB đã được cài đặt
mongod

# Hoặc sử dụng MongoDB Container
docker run -d -p 27017:27017 --name mongodb mongo
```

---

## 📦 Công Nghệ Sử Dụng

### Backend
| Công Nghệ | Mục Đích |
|-----------|---------|
| **Express** | Web framework |
| **MongoDB** | Database |
| **Mongoose** | ODM (Object Data Modeling) |
| **JWT** | Authentication & Authorization |
| **Bcrypt** | Password hashing |
| **Multer** | File upload handling |
| **Stripe** | Payment processing |
| **CORS** | Cross-origin resource sharing |
| **Helmet** | Security headers |
| **Express Rate Limit** | API rate limiting |
| **Dotenv** | Environment variables |

### Frontend
| Công Nghệ | Mục Đích |
|-----------|---------|
| **React 18/19** | UI library |
| **Vite** | Build tool & dev server |
| **React Router** | Navigation |
| **Axios** | HTTP client |
| **SASS** | Styling |
| **React Toastify** | Notifications |

### Admin Panel
| Công Nghệ | Mục Đích |
|-----------|---------|
| **React 19** | UI library |
| **Vite** | Build tool |
| **React Router** | Navigation |
| **Axios** | HTTP client |
| **Stripe.js** | Payment integration |
| **React Toastify** | Notifications |
| **SASS** | Styling |

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/user/register          - Đăng ký người dùng
POST   /api/user/login             - Đăng nhập
GET    /api/user/profile           - Lấy thông tin người dùng
```

### Food Management
```
GET    /api/food/list              - Lấy danh sách thực đơn
GET    /api/food/:id               - Chi tiết món ăn
POST   /api/food/add               - Thêm món ăn (Admin)
PUT    /api/food/update/:id        - Cập nhật món ăn (Admin)
DELETE /api/food/remove/:id        - Xóa món ăn (Admin)
```

### Orders
```
GET    /api/order/list             - Danh sách đơn hàng (Admin)
GET    /api/order/userorders       - Đơn hàng của người dùng
POST   /api/order/place            - Tạo đơn hàng
PUT    /api/order/status/:id       - Cập nhật trạng thái (Admin)
GET    /api/orders/subscribe       - Real-time order updates (SSE)
```

### Payments
```
POST   /api/payment/verify         - Xác minh thanh toán Stripe
```

### Reviews
```
POST   /api/review/add             - Thêm đánh giá
GET    /api/review/list            - Danh sách đánh giá
DELETE /api/review/remove/:id      - Xóa đánh giá
```

### Categories
```
GET    /api/category/list          - Danh sách danh mục
POST   /api/category/add           - Thêm danh mục (Admin)
```

### Promo Codes
```
GET    /api/promo/list             - Danh sách mã khuyến mãi
POST   /api/promo/add              - Thêm mã khuyến mãi (Admin)
POST   /api/promo/verify           - Xác minh mã khuyến mãi
```

### Statistics
```
GET    /api/stats/overview         - Thống kê tổng quát (Admin)
GET    /api/stats/revenue          - Thống kê doanh thu (Admin)
GET    /api/stats/orders           - Thống kê đơn hàng (Admin)
```

---

## 🔐 Các Biến Môi Trường

### Backend (.env)
```env
# Server
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/flash-food

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Payment
STRIPE_SECRET_KEY=sk_test_xxxxx

# CORS (Optional)
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
```

### Admin (.env)
```env
VITE_API_URL=http://localhost:4000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
```

---

## 👤 Tài Khoản Demo

### Admin Account
- **Email**: `admin@flashfood.com`
- **Password**: `Admin@123`

### Customer Account
- **Email**: `customer@flashfood.com`
- **Password**: `Customer@123`

> ⚠️ **Lưu ý**: Thay đổi mật khẩu sau lần đăng nhập đầu tiên

---

## 🔄 Quy Trình Đặt Hàng

```
1. Khách hàng duyệt thực đơn (Home)
    ↓
2. Thêm sản phẩm vào giỏ hàng (Cart)
    ↓
3. Nhập địa chỉ giao hàng (Order form)
    ↓
4. Áp dụng mã khuyến mãi (nếu có)
    ↓
5. Thực hiện thanh toán qua Stripe
    ↓
6. Xác minh thanh toán
    ↓
7. Đơn hàng được tạo với trạng thái "Pending"
    ↓
8. Admin xác nhận đơn hàng (Real-time notification)
    ↓
9. Khách hàng theo dõi trạng thái (SSE)
    ↓
10. Đơn hàng hoàn thành
```

---

## 💻 Lệnh Hữu Ích

### Backend
```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
npm run server

# Lint code
npm run lint
```

### Frontend
```bash
# Cài đặt dependencies
npm install

# Development server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Admin
```bash
# Cài đặt dependencies
npm install

# Development server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🐛 Troubleshooting

### Issue: `Cannot connect to MongoDB`
**Giải pháp:**
- Kiểm tra MongoDB đang chạy: `mongo` hoặc `mongosh`
- Kiểm tra MONGODB_URI trong .env
- Nếu dùng MongoDB Atlas, kiểm tra IP whitelist

### Issue: `CORS error`
**Giải pháp:**
- Kiểm tra VITE_API_URL được cấu hình đúng
- Xác minh backend CORS settings
- Thử clear browser cache

### Issue: `Stripe payment fails`
**Giải pháp:**
- Kiểm tra Stripe keys đã được set đúng
- Dùng test card: `4242 4242 4242 4242`
- Kiểm tra Stripe API version compatibility

### Issue: `Port already in use`
**Giải pháp:**
```bash
# Kill process on port 4000
lsof -i :4000
kill -9 <PID>

# Hoặc change port in .env
PORT=5000
```

---

## 📚 Các Tài Liệu Cần Tham Khảo

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Stripe Integration Guide](https://stripe.com/docs)
- [JWT Authentication](https://jwt.io/)

---

## 📊 Performance & Security

### Security Features
- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ CORS enabled with whitelist
- ✅ Helmet security headers
- ✅ Rate limiting on auth endpoints
- ✅ Input validation & sanitization
- ✅ HTTPS ready

### Performance Features
- ✅ Real-time updates with SSE
- ✅ Caching mechanism
- ✅ Database indexing (indexes on email, userId)
- ✅ Optimized image upload
- ✅ API rate limiting

---

## 🚧 Tính Năng Sắp Tới

- [ ] Multi-language support (i18n)
- [ ] SMS notifications
- [ ] Email notifications
- [ ] Loyalty points system
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Restaurant dashboard
- [ ] Delivery tracking GPS

---

## 📝 License

This project is licensed under the **ISC License** - see the LICENSE file for details.

---

## 👨‍💻 Contributors

- **Project**: Flash-Food Learning Project
- **Course**: Công Nghệ Phần Mềm (Software Engineering)

---

## 📞 Liên Hệ & Hỗ Trợ

Nếu bạn gặp vấn đề hoặc có câu hỏi, vui lòng:

1. **Tạo Issue** trên GitHub
2. **Email**: your-email@example.com
3. **Discord**: your-discord-link

---

## 🙏 Cảm Ơn

Cảm ơn đã sử dụng Flash-Food! Nếu thích project này, vui lòng ⭐ Star trên GitHub.

---

**Phiên bản**: 1.0.0  
**Cập nhật cuối**: 2026  
**Status**: 🟢 Active Development