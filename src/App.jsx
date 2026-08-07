import { useState } from 'react'
import Login from './components/Login'
import './App.css'

function App() {
    // Lấy vai trò từ bộ nhớ trình duyệt (nếu người dùng đã đăng nhập trước đó)
    const [vaiTro, setVaiTro] = useState(localStorage.getItem('vaiTro'))

    // Hàm nhận tín hiệu từ màn hình Login báo về
    const xuLyDangNhapThanhCong = (vaiTroMoi) => {
        setVaiTro(vaiTroMoi);
    }

    // Hàm xóa dữ liệu để đăng xuất
    const dangXuat = () => {
        localStorage.removeItem('vaiTro');
        setVaiTro(null);
    }

    // Nếu biến vaiTro bị rỗng (chưa đăng nhập) -> Ép hiển thị màn hình Login
    if (!vaiTro) {
        return <Login onLoginSuccess={xuLyDangNhapThanhCong} />
    }

    // Nếu đã đăng nhập thành công, hiển thị giao diện Dashboard
    return (
        <div className="container" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                <h1>Hệ thống Quản lý Thư viện</h1>
                <div>
                    <span style={{ marginRight: '15px' }}>Xin chào! Quyền của bạn: <strong>{vaiTro}</strong></span>
                    <button onClick={dangXuat} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Đăng xuất</button>
                </div>
            </div>

            <div style={{ marginTop: '20px' }}>
                {/* Chúng ta sẽ sử dụng các câu lệnh IF để hiển thị tính năng theo vai trò ở đây */}
                {vaiTro === 'GiamDoc' && <h2>Đây là khu vực Báo cáo dành riêng cho Giám Đốc</h2>}
                {vaiTro === 'ThuThu' && <h2>Đây là khu vực Quản lý Mượn Trả dành cho Thủ Thư</h2>}
                {vaiTro === 'BanDoc' && <h2>Đây là khu vực Tra cứu Sách dành cho Bạn Đọc</h2>}
            </div>
        </div>
    )
}

export default App