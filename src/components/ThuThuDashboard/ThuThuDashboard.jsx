import { useState } from 'react';
import QuanLyBanDoc from './QuanLyBanDoc/quan_li_ban_doc';
import QuanLyDanhMuc from './QuanLyDanhMuc/QuanLyDanhMuc';
import QuanLySach from './QuanLySach/QuanLySach';
function ThuThuDashboard() {
    // Biến ghi nhớ chức năng đang được mở. Rỗng ('') nghĩa là đang ở màn hình chính.
    const [chucNangDangChon, setChucNangDangChon] = useState('');

    // Danh sách các khối chức năng
    const cacChucNang = [
        { id: 'ThongKe', ten: 'Thống kê & Báo cáo', mauSac: '#17a2b8', icon: '📊' },
        { id: 'MuonTra', ten: 'Quản lý Mượn / Trả', mauSac: '#28a745', icon: '🔄' },
        { id: 'KhoSach', ten: 'Quản lý Kho sách', mauSac: '#ffc107', icon: '📚' },
        { id: 'DanhMuc', ten: 'Quản lý Danh mục', mauSac: '#fd7e14', icon: '🗂️' },
        { id: 'BanDoc', ten: 'Quản lý Bạn đọc', mauSac: '#6f42c1', icon: '👥' },
        { id: 'Phat', ten: 'Xử lý Vi phạm', mauSac: '#dc3545', icon: '⚠️' },
        { id: 'ThongBao', ten: 'Gửi Thông báo', mauSac: '#20c997', icon: '✉️' }, 
        { id: 'NhatKy', ten: 'Nhật ký Hoạt động', mauSac: '#6c757d', icon: '🕒' } 
    ];

    // 1. NẾU CHƯA CHỌN CHỨC NĂNG NÀO -> HIỂN THỊ SƠ ĐỒ LƯỚI
    if (chucNangDangChon === '') {
        return (
            <div style={{ padding: '20px' }}>
                <h2 style={{ textAlign: 'center', color: '#004085', marginBottom: '40px', textTransform: 'uppercase' }}>
                    Bảng Điều Khiển Nghiệp Vụ Thủ Thư
                </h2>

                {/* Vùng chứa CSS Grid để sắp xếp các ô vuông tự động co giãn */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '25px',
                    justifyContent: 'center'
                }}>
                    {cacChucNang.map((chucNang) => (
                        <div
                            key={chucNang.id}
                            onClick={() => setChucNangDangChon(chucNang.id)}
                            style={{
                                backgroundColor: 'white',
                                borderTop: `5px solid ${chucNang.mauSac}`,
                                borderRadius: '8px',
                                padding: '40px 20px',
                                textAlign: 'center',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            // Hiệu ứng phóng to nhẹ khi di chuột vào
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                            }}
                        >
                            <div style={{ fontSize: '50px', marginBottom: '15px' }}>{chucNang.icon}</div>
                            <h3 style={{ margin: 0, color: '#333', fontSize: '18px' }}>{chucNang.ten}</h3>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 2. NẾU ĐÃ BẤM CHỌN 1 CHỨC NĂNG -> HIỂN THỊ GIAO DIỆN CHỨC NĂNG ĐÓ
    return (
        <div>
            {/* Nút quay lại luôn nằm ở trên cùng */}
            <button
                onClick={() => setChucNangDangChon('')}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginBottom: '20px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                <span>⬅</span> Quay lại Bảng điều khiển
            </button>

            {/* Khu vực thay đổi nội dung tùy theo nghiệp vụ */}
            <div style={{ border: '1px solid #e0e0e0', padding: '30px', borderRadius: '8px', backgroundColor: 'white', minHeight: '500px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                {chucNangDangChon === 'ThongKe' && <h2 style={{ color: '#17a2b8' }}>Khu vực Biểu đồ & Thống kê</h2>}
                {chucNangDangChon === 'MuonTra' && <h2 style={{ color: '#28a745' }}>Khu vực Duyệt phiếu & Mượn trả sách</h2>}
                {chucNangDangChon === 'KhoSach' && <QuanLySach />}
                {chucNangDangChon === 'DanhMuc' && <QuanLyDanhMuc/>}
                {chucNangDangChon === 'BanDoc' && <QuanLyBanDoc />}
                {chucNangDangChon === 'Phat' && <QuanLyBanDoc/>}
                {chucNangDangChon === 'ThongBao' && <h2 style={{ color: '#20c997' }}>Khu vực Nhắc nhở & Gửi thông báo</h2>}
                {chucNangDangChon === 'NhatKy' && <h2 style={{ color: '#6c757d' }}>Khu vực Đối soát thao tác hệ thống</h2>}
            </div>
        </div>
    );
}

export default ThuThuDashboard;