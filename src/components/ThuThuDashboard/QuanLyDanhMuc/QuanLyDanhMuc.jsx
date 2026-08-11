import { useState } from 'react';
import QuanLyTacGia from './QuanLyTacGia';
import QuanLyTheLoai from './QuanLyTheLoai';
import QuanLyNXB from './QuanLyNXB';
import QuanLyKeSach from './QuanLyKeSach';
function QuanLyDanhMuc() {
    // Biến điều hướng: Lưu trữ xem Thủ thư đang chọn xem danh mục nào
    const [danhMucDangChon, setDanhMucDangChon] = useState('');

    // Cấu hình 5 khối chức năng cho phân hệ Danh mục
    const cacDanhMuc = [
        { id: 'DauSach', ten: 'Đầu sách', mauSac: '#007bff', icon: '📚' },
        { id: 'KeSach', ten: 'Kệ sách', mauSac: '#28a745', icon: '🗄️' },
        { id: 'TacGia', ten: 'Tác giả', mauSac: '#17a2b8', icon: '✍️' },
        { id: 'TheLoai', ten: 'Thể loại', mauSac: '#fd7e14', icon: '🏷️' },
        { id: 'NhaXuatBan', ten: 'Nhà xuất bản', mauSac: '#dc3545', icon: '🏢' }
    ];

    // GIAO DIỆN 1: BẢNG LƯỚI MENU DANH MỤC
    if (danhMucDangChon === '') {
        return (
            <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                <h2 style={{ color: '#6f42c1', marginBottom: '25px', textTransform: 'uppercase', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
                    Phân hệ Quản lý Danh mục
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {cacDanhMuc.map((danhmuc) => (
                        <div 
                            key={danhmuc.id}
                            onClick={() => setDanhMucDangChon(danhmuc.id)}
                            style={{
                                backgroundColor: 'white',
                                borderTop: `5px solid ${danhmuc.mauSac}`,
                                borderRadius: '8px',
                                padding: '30px 15px',
                                textAlign: 'center',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ fontSize: '45px', marginBottom: '15px' }}>{danhmuc.icon}</div>
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>{danhmuc.ten}</h3>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // GIAO DIỆN 2: CHI TIẾT TỪNG DANH MỤC (SẼ GỌI CÁC COMPONENT CON VÀO ĐÂY)
    return (
        <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
            <button 
                onClick={() => setDanhMucDangChon('')}
                style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <span>⬅</span> Quay lại Menu Danh mục
            </button>

            {/* Khu vực hiển thị nội dung chi tiết tương ứng với lựa chọn */}
            {danhMucDangChon === 'DauSach' && <h3 style={{ color: '#007bff' }}>Khu vực hiển thị danh sách Đầu Sách (Chờ phát triển)</h3>}
            {danhMucDangChon === 'KeSach' && <QuanLyKeSach />}
            {danhMucDangChon === 'TacGia' && <QuanLyTacGia />}
            {danhMucDangChon === 'TheLoai' && <QuanLyTheLoai />}
            {danhMucDangChon === 'NhaXuatBan' && <QuanLyNXB />}
        </div>
    );
}

export default QuanLyDanhMuc;