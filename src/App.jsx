import { useState } from 'react';
import Login from './components/Login';
import ThuThuDashboard from './components/ThuThuDashboard/ThuThuDashboard';
import './App.css';
import LogoOU from './assets/LogoOU.png';

function App() {
    const [vaiTro, setVaiTro] = useState(localStorage.getItem('vaiTro'));
    const [name, setName] = useState(localStorage.getItem('tenDangNhap'));

    const xuLyDangNhapThanhCong = (vaiTroMoi, tenDangNhapMoi) => {
        setVaiTro(vaiTroMoi);
        setName(tenDangNhapMoi);
    };

    const dangXuat = () => {
        localStorage.removeItem('vaiTro');
        localStorage.removeItem('tenDangNhap');
        setVaiTro(null);
        setName(null);
    };

    
    if (!vaiTro) {
        return <Login onLoginSuccess={xuLyDangNhapThanhCong} />;
    }

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh', margin: '-8px', padding: '20px' }}>

            {/* KHU VỰC HEADER CÓ LOGO */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'white',
                padding: '15px 30px',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                marginBottom: '25px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <img
                        src={LogoOU}
                        alt="Logo Đại học Mở TP.HCM"
                        style={{ height: '65px', objectFit: 'contain' }}
                    />
                    <h1 style={{ margin: 0, color: '#004085', fontSize: '24px', textTransform: 'uppercase' }}>
                        Hệ thống Quản lý Thư viện
                    </h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '16px', color: '#555' }}>
                        Xin chào <strong style={{ color: '#d9534f', fontSize: '18px' }}>{name}</strong>
                    </span>
                    <button
                        onClick={dangXuat}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'background-color 0.3s'
                        }}
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>

            {/* KHU VỰC NỘI DUNG THAY ĐỔI THEO QUYỀN */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                {vaiTro === 'GiamDoc' && <h2>Đây là khu vực Báo cáo dành riêng cho Giám Đốc</h2>}
                {vaiTro === 'ThuThu' && <ThuThuDashboard />}
                {vaiTro === 'BanDoc' && <h2>Đây là khu vực Tra cứu Sách dành cho Bạn Đọc</h2>}
            </div>

        </div>
    );
}

export default App;