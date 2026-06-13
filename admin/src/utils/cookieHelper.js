// Cookie helper functions with security flags

/**
 * Set cookie với đầy đủ flag bảo mật
 * @param {string} name - Tên cookie
 * @param {string} value - Giá trị cookie
 * @param {number} days - Số ngày hết hạn
 * @param {boolean} secure - Chỉ gửi qua HTTPS (mặc định true)
 * @param {boolean} httpOnly - Không thể truy cập bằng JS (chú ý: không thể set từ frontend)
 * @param {string} sameSite - Chống CSRF: 'Strict', 'Lax', hoặc 'None'
 */
export const setCookie = (name, value, days, secure = true, sameSite = 'Strict') => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    let cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    
    // 🔥 THÊM FLAG BẢO MẬT
    if (secure) {
        cookieString += ';Secure';  // Chỉ gửi qua HTTPS
    }
    
    cookieString += `;SameSite=${sameSite}`;  // Chống CSRF
    
    // ⚠️ LƯU Ý: HttpOnly KHÔNG THỂ set từ JavaScript phía client
    // HttpOnly chỉ có thể set từ backend (server)
    // Đây là lý do nên dùng backend để set cookie thay vì frontend
    
    document.cookie = cookieString;
    console.log(`🍪 Cookie set: ${name}, secure=${secure}, sameSite=${sameSite}`);
};

/**
 * Get cookie value
 */
export const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

/**
 * Remove cookie (xóa cookie)
 */
export const removeCookie = (name) => {
    // Xóa cookie với cùng flags để đảm bảo
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;Secure;SameSite=Strict`;
    console.log(`🍪 Cookie removed: ${name}`);
};

/**
 * Kiểm tra cookie có an toàn không
 */
export const isCookieSecure = (name) => {
    const cookie = getCookie(name);
    if (!cookie) return false;
    
    // Kiểm tra xem cookie có flag Secure không
    // Lưu ý: JavaScript không thể đọc flag Secure trực tiếp
    // Đây là hàm kiểm tra cơ bản
    return window.location.protocol === 'https:';
};

/**
 * Lấy tất cả cookies (chỉ dùng cho debug)
 */
export const getAllCookies = () => {
    const cookies = {};
    document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name) cookies[name] = value;
    });
    return cookies;
};