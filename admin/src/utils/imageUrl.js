// Build URL ảnh từ path lưu trong DB.
// Hỗ trợ mọi format dữ liệu cũ/mới mà không tạo URL kiểu /uploads/uploads/...
//   "http://..."             → giữ nguyên
//   "/uploads/banhmi/x.jpg"  → ${api}/uploads/banhmi/x.jpg
//   "/images/x.jpg"          → ${api}/images/x.jpg
//   "uploads/banhmi/x.jpg"   → ${api}/uploads/banhmi/x.jpg
//   "banhmi/x.jpg"           → ${api}/uploads/banhmi/x.jpg
//   "1778x.jpeg"             → ${api}/images/1778x.jpeg  (multer lưu vào uploads/images/)
const API = import.meta.env.VITE_API_URL || "";

export const buildImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;

  const base = API.endsWith("/") ? API.slice(0, -1) : API;
  const p = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;

  if (p.startsWith("uploads/") || p.startsWith("images/")) {
    return `${base}/${p}`;
  }
  if (p.includes("/")) {
    return `${base}/uploads/${p}`;
  }
  return `${base}/images/${p}`;
};
