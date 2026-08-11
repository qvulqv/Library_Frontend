import { useState } from 'react';
import DanhSachBanDoc from './DanhSachBanDoc'; 
import ThemBanDoc from './ThemBanDoc'; 
function QuanLyBanDoc() {
    const [chucNangConDangChon, setChucNangConDangChon] = useState('');

    const cacChucNangCon = [
        { id: 'DanhSach', ten: 'Danh sách Bạn đọc', mauSac: '#007bff', icon: '📋' },
        { id: 'ThemMoi', ten: 'Thêm Bạn đọc mới', mauSac: '#28a745', icon: '➕' },
        { id: 'LichSu', ten: 'Lịch sử Mượn/Trả', mauSac: '#17a2b8', icon: '🕒' },
        { id: 'ViPham', ten: 'Xử lý Vi phạm', mauSac: '#dc3545', icon: '🔒' }
    ];

    if (chucNangConDangChon === '') {
        return (
            <div>
                <h2 style={{ color: '#6f42c1', marginBottom: '25px', textTransform: 'uppercase', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
                    Phân hệ Quản lý Bạn đọc
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {cacChucNangCon.map((chucNang) => (
                        <div
                            key={chucNang.id}
                            onClick={() => setChucNangConDangChon(chucNang.id)}
                            style={{
                                backgroundColor: 'white', borderTop: `5px solid ${chucNang.mauSac}`,
                                borderRadius: '8px', padding: '30px 15px', textAlign: 'center',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.08)', cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ fontSize: '45px', marginBottom: '15px' }}>{chucNang.icon}</div>
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>{chucNang.ten}</h3>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={() => setChucNangConDangChon('')}
                style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <span>⬅</span> Quay lại Menu Bạn đọc
            </button>

            {/* Gọi Component DanhSachBanDoc ra để hiển thị thay vì viết mã dài dòng ở đây */}
            {chucNangConDangChon === 'DanhSach' && <DanhSachBanDoc />}

            {chucNangConDangChon === 'ThemMoi' && <ThemBanDoc />}
            {chucNangConDangChon === 'LichSu' && <h3 style={{ color: '#17a2b8' }}>Khu vực tra cứu lịch sử Mượn/Trả của sinh viên</h3>}
            {chucNangConDangChon === 'ViPham' && <h3 style={{ color: '#dc3545' }}>Khu vực cảnh cáo và khóa tài khoản vi phạm</h3>}
        </div>
    );
}

export default QuanLyBanDoc;