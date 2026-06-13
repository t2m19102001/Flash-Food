# Flash Food

Hệ thống đặt món ăn trực tuyến được xây dựng theo kiến trúc monorepo, gồm ba dịch vụ độc lập: API backend, ứng dụng web cho khách hàng và trang quản trị cho người vận hành.

## Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng](#tính-năng)
- [Kiến trúc](#kiến-trúc)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Cài đặt](#cài-đặt)
- [Cấu hình biến môi trường](#cấu-hình-biến-môi-trường)
- [Chạy dự án](#chạy-dự-án)
- [Build sản phẩm](#build-sản-phẩm)
- [Tài liệu API](#tài-liệu-api)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Tài liệu thiết kế](#tài-liệu-thiết-kế)

## Tổng quan

Flash Food cung cấp một quy trình đặt món hoàn chỉnh: khách hàng duyệt thực đơn, thêm vào giỏ hàng, thanh toán và theo dõi đơn hàng; quản trị viên quản lý sản phẩm, đơn hàng, người dùng và đánh giá thông qua một bảng điều khiển riêng. Hệ thống hỗ trợ thanh toán qua Stripe và MoMo.

## Tính năng

### Ứng dụng khách hàng

- Duyệt thực đơn theo danh mục và tìm kiếm món ăn.
- Quản lý giỏ hàng và đặt hàng.
- Thanh toán trực tuyến qua Stripe và MoMo.
- Theo dõi trạng thái đơn hàng và xem chi tiết đơn.
- Đánh giá món ăn kèm hình ảnh; xem phản hồi từ quản trị viên.

### Trang quản trị

- Quản lý sản phẩm, danh mục và banner.
- Quản lý đơn hàng và cập nhật trạng thái.
- Quản lý người dùng.
- Quản lý đánh giá: ẩn/hiện và phản hồi.
- Thống kê và xuất báo cáo (PDF, Excel).

### Backend

- API RESTful với xác thực JWT và phân quyền theo vai trò.
- Tải lên hình ảnh qua Multer.
- Các lớp bảo mật: Helmet, CORS, giới hạn tần suất truy cập (rate limiting), kiểm tra dữ liệu đầu vào.

## Kiến trúc

```
Flash-Food/
├── Flash-Food-Clone-BackEnd/   API backend (Node.js, Express, MongoDB)
├── Flash-Food-Clone-main/      Ứng dụng web khách hàng (React, Vite)
└── admin/                      Trang quản trị (React, Vite)
```

Ba dịch vụ giao tiếp qua HTTP. Hai ứng dụng frontend gọi đến API backend thông qua biến môi trường `VITE_API_URL`.

## Công nghệ sử dụng

| Thành phần | Công nghệ chính |
| --- | --- |
| Backend | Node.js, Express 5, MongoDB (Mongoose), JWT, Multer, Stripe, Helmet |
| Khách hàng | React 18, Vite, React Router, Axios, Sass |
| Quản trị | React 19, Vite, React Router, Axios, Sass, jsPDF, xlsx |

## Yêu cầu môi trường

- Node.js phiên bản 20 trở lên (xem `.nvmrc`).
- MongoDB (cục bộ hoặc dịch vụ đám mây như MongoDB Atlas).

## Cài đặt

Clone repository và cài đặt phụ thuộc cho cả ba dịch vụ:

```bash
git clone https://github.com/t2m19102001/Flash-Food.git
cd Flash-Food
npm install
npm run install:all
```

Lệnh `npm run install:all` sẽ cài đặt phụ thuộc lần lượt cho backend, ứng dụng khách hàng và trang quản trị.

## Cấu hình biến môi trường

Mỗi dịch vụ cần một tệp `.env` riêng. Các tệp này không được đưa lên repository.

### `Flash-Food-Clone-BackEnd/.env`

```
PORT=4000
NODE_ENV=development
MONGO_URI=
JWT_SECRET=
ALLOWED_ORIGINS=
BLOCKED_IPS=

# Stripe
STRIPE_SECRET_KEY=

# MoMo
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_PARTNER_NAME=
MOMO_STORE_NAME=
MOMO_REDIRECT_URL=
MOMO_IPN_URL=
```

### `Flash-Food-Clone-main/.env` và `admin/.env`

```
VITE_API_URL=http://localhost:4000
VITE_STRIPE_PUBLISHABLE_KEY=
```

## Chạy dự án

Chạy đồng thời cả ba dịch vụ ở chế độ phát triển từ thư mục gốc:

```bash
npm run dev
```

Lệnh trên khởi động backend, ứng dụng khách hàng và trang quản trị cùng lúc. Mặc định backend chạy tại cổng `4000`.

Chạy riêng từng dịch vụ khi cần:

```bash
npm run dev:be      # Backend
npm run dev:fe      # Ứng dụng khách hàng
npm run dev:admin   # Trang quản trị
```

## Build sản phẩm

```bash
npm run build       # Build cả hai ứng dụng frontend
npm run build:fe    # Chỉ build ứng dụng khách hàng
npm run build:admin # Chỉ build trang quản trị
```

## Tài liệu API

Tất cả endpoint đều có tiền tố `/api`. Các nhóm endpoint chính:

| Tiền tố | Chức năng |
| --- | --- |
| `/api/user` | Đăng ký, đăng nhập, quản lý tài khoản |
| `/api/food` | Quản lý món ăn |
| `/api/category` | Quản lý danh mục |
| `/api/order` | Đặt hàng và quản lý đơn hàng |
| `/api/payment` | Thanh toán (Stripe, MoMo) |
| `/api/review` | Đánh giá món ăn |
| `/api/banner` | Quản lý banner |
| `/api/promo` | Quản lý mã khuyến mãi |
| `/api/notifications` | Thông báo |
| `/api/report` | Báo cáo |
| `/api/stats` | Thống kê |
| `/api/contact` | Liên hệ |
| `/api/admin` | Chức năng quản trị |

### Ví dụ: nhóm endpoint đánh giá

| Phương thức | Đường dẫn | Mô tả | Quyền |
| --- | --- | --- | --- |
| `POST` | `/api/review/add` | Thêm đánh giá | Người dùng |
| `PUT` | `/api/review/edit/:reviewId` | Sửa đánh giá | Người dùng |
| `DELETE` | `/api/review/delete/:reviewId` | Xóa đánh giá | Người dùng |
| `GET` | `/api/review/my-review/:foodId` | Xem đánh giá của bản thân | Người dùng |
| `GET` | `/api/review/food/:foodId` | Danh sách đánh giá của một món | Công khai |
| `GET` | `/api/review/list` | Danh sách toàn bộ đánh giá | Quản trị |
| `PATCH` | `/api/review/toggle-visibility/:reviewId` | Ẩn/hiện đánh giá | Quản trị |

## Cấu trúc thư mục

```
Flash-Food-Clone-BackEnd/
├── controllers/   Xử lý logic nghiệp vụ
├── models/        Định nghĩa schema Mongoose
├── routers/       Định nghĩa route API
├── middleware/    Xác thực, bảo mật, kiểm tra dữ liệu
├── uploads/       Hình ảnh tải lên
└── server.js      Điểm khởi chạy ứng dụng

Flash-Food-Clone-main/
└── src/
    ├── components/   Các thành phần giao diện tái sử dụng
    ├── pages/        Các trang
    ├── context/      Quản lý state toàn cục
    └── services/     Gọi API

admin/
└── src/
    ├── components/   Các thành phần giao diện
    ├── pages/        Các trang quản trị
    └── utils/        Tiện ích dùng chung
```

## Tài liệu thiết kế

Thư mục `Use_Case_Diagram_Class_Diagram_ERD/` chứa các sơ đồ thiết kế ở định dạng `.drawio`:

- Use Case Diagram
- Class Diagram và ERD
- Sequence Diagram cho các luồng nghiệp vụ chính
