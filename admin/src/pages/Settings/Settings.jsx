import React, { useState, useEffect } from 'react'
import './Settings.scss'
import axios from 'axios'
import { toast } from 'react-toastify'

const Settings = ({ url }) => {
    const [activeTab, setActiveTab] = useState('general')
    const [loading, setLoading] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(true)
    
    // General Settings
    const [generalSettings, setGeneralSettings] = useState({
        siteName: 'Flash Food',
        siteDescription: 'Nền tảng giao đồ ăn trực tuyến hàng đầu',
        contactEmail: 'support@flashfood.com',
        contactPhone: '1900 1234',
        address: '123 Đường Học Tập, Quận 9, TP.HCM',
        shippingFee: 15000,
        taxRate: 0
    })
    
    // Payment Settings
    const [paymentSettings, setPaymentSettings] = useState({
        codEnabled: true,
        momoEnabled: true,
        stripeEnabled: false,
        momoAccessKey: '',
        momoSecretKey: '',
        stripePublicKey: '',
        stripeSecretKey: ''
    })
    
    // Notification Settings
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        orderConfirmEmail: true,
        orderStatusSMS: false,
        adminNewOrderEmail: true
    })
    
    const [logoPreview, setLogoPreview] = useState(null)
    const [logoFile, setLogoFile] = useState(null)

    const fetchSettings = async () => {
        setFetchLoading(true)
        try {
            const response = await axios.get(`${url}/api/settings`, { withCredentials: true })
            if (response.data.success) {
                const data = response.data.settings
                if (data) {
                    setGeneralSettings(prev => ({ ...prev, ...data.general }))
                    setPaymentSettings(prev => ({ ...prev, ...data.payment }))
                    setNotificationSettings(prev => ({ ...prev, ...data.notification }))
                }
            }
        } catch (error) { 
            console.error("Lỗi tải cài đặt:", error)
            toast.error("Không thể tải cài đặt hệ thống")
        } finally {
            setFetchLoading(false)
        }
    }

    const handleGeneralSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData()
        Object.keys(generalSettings).forEach(key => { 
            if (generalSettings[key] !== null) formData.append(key, generalSettings[key]) 
        })
        if (logoFile) formData.append('logo', logoFile)
        
        try {
            const response = await axios.post(`${url}/api/settings/update`, formData, { 
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            if (response.data.success) {
                toast.success("Cập nhật cài đặt thành công!")
                fetchSettings()
            } else {
                toast.error(response.data.message || "Cập nhật thất bại")
            }
        } catch (error) { 
            toast.error(error.response?.data?.message || "Lỗi cập nhật cài đặt") 
        } finally { 
            setLoading(false) 
        }
    }

    const handlePaymentSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await axios.post(`${url}/api/settings/payment`, paymentSettings, { 
                withCredentials: true 
            })
            if (response.data.success) {
                toast.success("Cập nhật cài đặt thanh toán thành công!")
            } else {
                toast.error(response.data.message || "Cập nhật thất bại")
            }
        } catch (error) { 
            toast.error("Lỗi cập nhật cài đặt thanh toán") 
        } finally { 
            setLoading(false) 
        }
    }

    const handleNotificationSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await axios.post(`${url}/api/settings/notification`, notificationSettings, { 
                withCredentials: true 
            })
            if (response.data.success) {
                toast.success("Cập nhật cài đặt thông báo thành công!")
            } else {
                toast.error(response.data.message || "Cập nhật thất bại")
            }
        } catch (error) { 
            toast.error("Lỗi cập nhật cài đặt thông báo") 
        } finally { 
            setLoading(false) 
        }
    }

    useEffect(() => { fetchSettings() }, [])

    if (fetchLoading) {
        return (
            <div className="settings-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải cài đặt...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="settings-page">
            <div className="page-header">
                <h2>⚙️ Cài đặt hệ thống</h2>
                <p>Quản lý cấu hình và tùy chỉnh hệ thống</p>
            </div>

            {/* Tabs */}
            <div className="settings-tabs">
                <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
                    🏠 Chung
                </button>
                <button className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => setActiveTab('payment')}>
                    💳 Thanh toán
                </button>
                <button className={`tab-btn ${activeTab === 'notification' ? 'active' : ''}`} onClick={() => setActiveTab('notification')}>
                    🔔 Thông báo
                </button>
            </div>

            {/* General Settings */}
            {activeTab === 'general' && (
                <form className="settings-content" onSubmit={handleGeneralSubmit}>
                    <h3>🏠 Thông tin chung</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Tên website</label>
                            <input type="text" value={generalSettings.siteName} onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Email liên hệ</label>
                            <input type="email" value={generalSettings.contactEmail} onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input type="tel" value={generalSettings.contactPhone} onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Phí giao hàng (VNĐ)</label>
                            <input type="number" value={generalSettings.shippingFee} onChange={(e) => setGeneralSettings({ ...generalSettings, shippingFee: parseInt(e.target.value) })} />
                        </div>
                        <div className="form-group full-width">
                            <label>Địa chỉ</label>
                            <textarea value={generalSettings.address} onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })} rows="3" />
                        </div>
                        <div className="form-group full-width">
                            <label>Logo website</label>
                            <div className="logo-upload">
                                <div className="logo-preview">
                                    <div className="logo-image">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo preview" />
                                        ) : (
                                            <div className="logo-placeholder">🍔</div>
                                        )}
                                    </div>
                                    <label className="upload-btn">
                                        Chọn ảnh logo
                                        <input type="file" accept="image/*" hidden onChange={(e) => { 
                                            const file = e.target.files[0]
                                            if (file) {
                                                setLogoFile(file)
                                                setLogoPreview(URL.createObjectURL(file))
                                            }
                                        }} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? <div className="spinner"></div> : "💾 Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
                <form className="settings-content" onSubmit={handlePaymentSubmit}>
                    <h3>💳 Cấu hình thanh toán</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Thanh toán khi nhận hàng (COD)</label>
                            <div className="toggle-switch">
                                <input type="checkbox" id="codEnabled" checked={paymentSettings.codEnabled} onChange={(e) => setPaymentSettings({ ...paymentSettings, codEnabled: e.target.checked })} />
                                <label htmlFor="codEnabled" className="toggle-label"></label>
                                <span>{paymentSettings.codEnabled ? '✅ Bật' : '❌ Tắt'}</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Thanh toán qua MoMo</label>
                            <div className="toggle-switch">
                                <input type="checkbox" id="momoEnabled" checked={paymentSettings.momoEnabled} onChange={(e) => setPaymentSettings({ ...paymentSettings, momoEnabled: e.target.checked })} />
                                <label htmlFor="momoEnabled" className="toggle-label"></label>
                                <span>{paymentSettings.momoEnabled ? '✅ Bật' : '❌ Tắt'}</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Thanh toán qua Stripe</label>
                            <div className="toggle-switch">
                                <input type="checkbox" id="stripeEnabled" checked={paymentSettings.stripeEnabled} onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeEnabled: e.target.checked })} />
                                <label htmlFor="stripeEnabled" className="toggle-label"></label>
                                <span>{paymentSettings.stripeEnabled ? '✅ Bật' : '❌ Tắt'}</span>
                            </div>
                        </div>
                    </div>
                    {paymentSettings.momoEnabled && (
                        <div className="form-grid">
                            <div className="form-group">
                                <label>MoMo Access Key</label>
                                <input type="text" value={paymentSettings.momoAccessKey} onChange={(e) => setPaymentSettings({ ...paymentSettings, momoAccessKey: e.target.value })} placeholder="Nhập Access Key" />
                            </div>
                            <div className="form-group">
                                <label>MoMo Secret Key</label>
                                <input type="password" value={paymentSettings.momoSecretKey} onChange={(e) => setPaymentSettings({ ...paymentSettings, momoSecretKey: e.target.value })} placeholder="Nhập Secret Key" />
                            </div>
                        </div>
                    )}
                    {paymentSettings.stripeEnabled && (
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Stripe Public Key</label>
                                <input type="text" value={paymentSettings.stripePublicKey} onChange={(e) => setPaymentSettings({ ...paymentSettings, stripePublicKey: e.target.value })} placeholder="pk_test_..." />
                            </div>
                            <div className="form-group">
                                <label>Stripe Secret Key</label>
                                <input type="password" value={paymentSettings.stripeSecretKey} onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeSecretKey: e.target.value })} placeholder="sk_test_..." />
                            </div>
                        </div>
                    )}
                    <div className="form-actions">
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? <div className="spinner"></div> : "💾 Lưu cài đặt"}
                        </button>
                    </div>
                </form>
            )}

            {/* Notification Settings */}
            {activeTab === 'notification' && (
                <form className="settings-content" onSubmit={handleNotificationSubmit}>
                    <h3>🔔 Cài đặt thông báo</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Bật thông báo email</label>
                            <div className="toggle-switch">
                                <input type="checkbox" id="emailNotifications" checked={notificationSettings.emailNotifications} onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })} />
                                <label htmlFor="emailNotifications" className="toggle-label"></label>
                                <span>{notificationSettings.emailNotifications ? '✅ Bật' : '❌ Tắt'}</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Gửi email xác nhận đơn hàng</label>
                            <div className="toggle-switch">
                                <input type="checkbox" id="orderConfirmEmail" checked={notificationSettings.orderConfirmEmail} onChange={(e) => setNotificationSettings({ ...notificationSettings, orderConfirmEmail: e.target.checked })} />
                                <label htmlFor="orderConfirmEmail" className="toggle-label"></label>
                                <span>{notificationSettings.orderConfirmEmail ? '✅ Bật' : '❌ Tắt'}</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Gửi SMS cập nhật trạng thái</label>
                            <div className="toggle-switch">
                                <input type="checkbox" id="orderStatusSMS" checked={notificationSettings.orderStatusSMS} onChange={(e) => setNotificationSettings({ ...notificationSettings, orderStatusSMS: e.target.checked })} />
                                <label htmlFor="orderStatusSMS" className="toggle-label"></label>
                                <span>{notificationSettings.orderStatusSMS ? '✅ Bật' : '❌ Tắt'}</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Thông báo đơn hàng mới cho Admin</label>
                            <div className="toggle-switch">
                                <input type="checkbox" id="adminNewOrderEmail" checked={notificationSettings.adminNewOrderEmail} onChange={(e) => setNotificationSettings({ ...notificationSettings, adminNewOrderEmail: e.target.checked })} />
                                <label htmlFor="adminNewOrderEmail" className="toggle-label"></label>
                                <span>{notificationSettings.adminNewOrderEmail ? '✅ Bật' : '❌ Tắt'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? <div className="spinner"></div> : "💾 Lưu cài đặt"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default Settings