import basket_icon from './basket_icon.png'
import logo from './logo.png'
import header_img from './header.jpg'
import search_icon from './search_icon.png'

// Category menu images — built from VITE_API_URL at build time
const API = import.meta.env.VITE_API_URL;
const ansang = `${API}/uploads/sang/48-bistro-52-ltr-quan-1-ho-chi-minh.jpg`
const antrua = `${API}/uploads/trua/com-suon-ba-cuong-nguyen-hue-quan-1-ho-chi-minh.jpg`
const antoi = `${API}/uploads/toi/bugis-singapore-am-thuc-singapore-vincom-center-quan-1-ho-chi-minh.jpg`
const anvat = `${API}/uploads/anvat/che-ba-ba.jpg`
const banhgio = `${API}/uploads/banhgio/gio-cha-lang-huong-quan-1-ho-chi-minh.jpg`
const banhmi = `${API}/uploads/banhmi/banh-mi-hong-hoa-nguyen-van-trang-62-nguyen-van-trang-p-ben-thanh-quan-1.jpg`
const bunrieu = `${API}/uploads/bunrieu/canh-bun-and-bun-rieu-nam-ky-khoi-nghia-quan-3-ho-chi-minh.jpg`
const cafe = `${API}/uploads/cafe/cong-caphe-vincom-dong-khoi-quan-1-ho-chi-minh.jpg`
const comtam = `${API}/uploads/comtam/phuc-loc-tho-com-tam-dam-da-tung-huong-vi-743-745-kha-van-can-p-linh-tay-quan-thu-duc.jpg`
const comvanphong = `${API}/uploads/comvanphong/venezia-pizza-com-van-phong-quan-1-ho-chi-minh.jpg`
const hutieu = `${API}/uploads/hutieu/a-chay-hu-tieu-mi-quan-1-ho-chi-minh.jpg`
const lau = `${API}/uploads/lau/kubara-lau-nhat-japanese-hotpot-saigon-centre-quan-1-ho-chi-minh.jpg`
const nuocep = `${API}/uploads/nuocep/duy-dua-quan-10-ho-chi-minh.jpg`
const sinhto = `${API}/uploads/sinhto/chang-zo-juice-nuoc-ep-dinh-duong-quan-1-ho-chi-minh.jpg`
const trasua = `${API}/uploads/trasua/38-flower-market-tea-house.jpg`
const xoiman = `${API}/uploads/xoiman/xoi-357-le-van-luong-quan-7-ho-chi-minh.jpg`

import add_icon_white from './add_icon_white.png'
import add_icon_green from './add_icon_green.png'
import remove_icon_red from './remove_icon_red.png'
import app_store from './app_store.png'
import play_store from './play_store.png'
import linkedin_icon from './linkedin_icon.png'
import facebook_icon from './facebook_icon.png'
import twitter_icon from './twitter_icon.png'
import cross_icon from './cross_icon.png'
import selector_icon from './selector_icon.png'
import profile_icon from './profile_icon.png'
import logout_icon from './logout_icon.png'
import rating_starts from './rating_starts.png'
import bag_icon from './bag_icon.png'
import parcel_icon from './parcel_icon.png'
import user_icons from './user_icons.png'
import add_icon from './add_icon.png'
import list_icon from './list_icon.png'
import order_icon from './order_icon.png'
import upload_area from './upload_area.jpg'

export const assets = {
    logo,
    basket_icon,
    header_img,
    search_icon,
    rating_starts,
    add_icon_green,
    add_icon_white,
    remove_icon_red,
    app_store,
    play_store,
    linkedin_icon,
    facebook_icon,
    twitter_icon,
    cross_icon,
    selector_icon,
    profile_icon,
    logout_icon,
    bag_icon,
    parcel_icon,
    user_icons, 
    add_icon,
    list_icon,
    order_icon,
    upload_area,
}

// Sample food list with backend URLs
export const food_list = [
    {
        _id: "1",
        name: "Bò nướng",
        image: `${API}/uploads/sang/48-bistro-52-ltr-quan-1-ho-chi-minh.jpg`,
        price: 120000,
        description: "Bò nướng cao cấp, rau thơm tươi ngon",
        category: "Sáng"
    },
    {
        _id: "2",
        name: "Bún trộn",
        image: `${API}/uploads/sang/bun-tron-quan-1-ho-chi-minh.jpg`,
        price: 35000,
        description: "Bún trộn đặc sản, đậm vị",
        category: "Sáng"
    },
    {
        _id: "3",
        name: "Hủ tiếu Thái Lan",
        image: `${API}/uploads/sang/hu-tieu-thai-lan-doi-thai-quan-1-ho-chi-minh.jpg`,
        price: 85000,
        description: "Hủ tiếu Thái Lan với hải sản tươi",
        category: "Sáng"
    },
    {
        _id: "4",
        name: "Mì xào giòn",
        image: `${API}/uploads/sang/hu-tiu-mi-xao-gion-a-minh-cho-cu-quan-1-ho-chi-minh.jpg`,
        price: 45000,
        description: "Mì xào giòn với topping đa dạng",
        category: "Sáng"
    },
    {
        _id: "5",
        name: "Phở bò",
        image: `${API}/uploads/sang/pho-co-lang-quan-1-ho-chi-minh.jpg`,
        price: 55000,
        description: "Phở bò truyền thống, nước dùng đậm đà",
        category: "Sáng"
    }
]

export const menu_list = [
    {
        menu_name: "Ăn sáng",
        menu_image: ansang
    },
    {
        menu_name: "Ăn trưa",
        menu_image: antrua
    },
    {
        menu_name: "Ăn tối",
        menu_image: antoi
    },
    {
        menu_name: "Ăn vặt",
        menu_image: anvat
    },
    {
        menu_name: "Bánh giò",
        menu_image: banhgio
    },
    {
        menu_name: "Bánh mì",
        menu_image: banhmi
    },
    {
        menu_name: "Bún riêu",
        menu_image: bunrieu
    },
    {
        menu_name: "Cà phê",
        menu_image: cafe
    },
    {
        menu_name: "Cơm tấm",
        menu_image: comtam
    },
    {
        menu_name: "Cơm văn phòng",
        menu_image: comvanphong
    },
    {
        menu_name: "Hủ tiếu",
        menu_image: hutieu
    },
    {
        menu_name: "Lẩu",
        menu_image: lau
    },
    {
        menu_name: "Nước ép",
        menu_image: nuocep
    },
    {
        menu_name: "Sinh tố",
        menu_image: sinhto
    },
    {
        menu_name: "Trà sữa",
        menu_image: trasua
    },
    {
        menu_name: "Xôi mặn",
        menu_image: xoiman
    }
]
