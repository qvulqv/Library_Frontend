import { useState, useEffect } from 'react';
import axios from 'axios';

function DanhSachBanDoc() {
    const [danhSachBanDoc, setDanhSachBanDoc] = useState([]);
    const [tuKhoa, setTuKhoa] = useState('');


    const [trangHienTai, setTrangHienTai] = useState(1);
    const soLuongMotTrang = 25; // Số lượng sinh viên muốn hiển thị trên 1 trang

    const layDuLieuBanDoc = () => {
        axios.get('http://127.0.0.1:8000/bandoc')
            .then((phanHoi) => {
                setDanhSachBanDoc(phanHoi.data);
            })
            .catch((error) => {
                console.error("Lỗi khi tải danh sách:", error);
                alert("Không thể kết nối đến máy chủ để tải dữ liệu!");
            });
    };

    useEffect(() => {
        layDuLieuBanDoc();
    }, []);

    const thayDoiTrangThai = (ma_bd, trangThaiHienTai) => {
        const trangThaiMoi = trangThaiHienTai === 'Hoạt động' ? 'Bị khóa' : 'Hoạt động';
        if (window.confirm(`Bạn có chắc chắn muốn chuyển tài khoản này thành "${trangThaiMoi}" không?`)) {
            axios.put(`http://127.0.0.1:8000/bandoc/${ma_bd}/trangthai`, {
                TrangThaiMoi: trangThaiMoi
            })
                .then(() => layDuLieuBanDoc())
                .catch(() => alert("Đã có lỗi xảy ra khi cập nhật trạng thái!"));
        }
    };

    const xoaBanDoc = (ma_bd) => {
        if (window.confirm(`⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN sinh viên có mã ${ma_bd} không?`)) {
            axios.delete(`http://127.0.0.1:8000/bandoc/${ma_bd}`)
                .then(() => {
                    alert("Đã xóa bạn đọc thành công!");
                    layDuLieuBanDoc();
                })
                .catch(() => alert("Đã có lỗi xảy ra khi xóa bạn đọc!"));
        }
    };

    // --- BƯỚC 2: HÀM XỬ LÝ TÌM KIẾM ---
    const xuLyTimKiem = (e) => {
        setTuKhoa(e.target.value);
        setTrangHienTai(1); // Trở về trang 1 mỗi khi gõ từ khóa mới
    };

    // Lọc dữ liệu theo từ khóa tìm kiếm (lọc trên tổng danh sách)
    const danhSachHienThi = danhSachBanDoc.filter(banDoc => {
        const ma = banDoc.ma_bd ? banDoc.ma_bd.toLowerCase() : '';
        const ten = banDoc.ho_ten ? banDoc.ho_ten.toLowerCase() : '';
        const khoa = tuKhoa.toLowerCase();

        return ma.includes(khoa) || ten.includes(khoa);
    });

    // --- BƯỚC 3: TÍNH TOÁN CẮT DANH SÁCH CHO TRANG HIỆN TẠI ---
    const chiSoCuoi = trangHienTai * soLuongMotTrang; // Ví dụ: Trang 1 * 25 = 25
    const chiSoDau = chiSoCuoi - soLuongMotTrang;     // Ví dụ: 25 - 25 = 0
    // Lấy đúng 25 người ra để vẽ lên bảng
    const danhSachTrenTrang = danhSachHienThi.slice(chiSoDau, chiSoCuoi);
    // Tính tổng số trang (Ví dụ: 100 người / 25 = 4 trang)
    const tongSoTrang = Math.ceil(danhSachHienThi.length / soLuongMotTrang);

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>Danh sách Bạn đọc</h3>

            <input
                type="text"
                placeholder="Nhập MSSV hoặc Tên sinh viên để tìm kiếm..."
                value={tuKhoa}
                onChange={xuLyTimKiem} // Gắn hàm tìm kiếm mới vào đây
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '20px', boxSizing: 'border-box' }}
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                        <th style={{ padding: '12px', textAlign: 'center' }}>MSSV</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Họ và Tên</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Trạng thái</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {/* BƯỚC 4: Đổi từ danhSachHienThi thành danhSachTrenTrang ở đây */}
                    {danhSachTrenTrang.map((banDoc, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #e9ecef' }}>
                            <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'middle' }}>
                                <strong>{banDoc.ma_bd}</strong>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'left', verticalAlign: 'middle' }}>{banDoc.ho_ten}</td>
                            <td style={{ padding: '12px', textAlign: 'left', verticalAlign: 'middle' }}>{banDoc.email}</td>
                            <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'middle' }}>
                                <span style={{
                                    padding: '6px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block',
                                    backgroundColor: banDoc.trang_thai === 'Hoạt động' ? '#d4edda' : '#f8d7da',
                                    color: banDoc.trang_thai === 'Hoạt động' ? '#155724' : '#721c24'
                                }}>
                                    {banDoc.trang_thai}
                                </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'middle' }}>
                                <button
                                    onClick={() => thayDoiTrangThai(banDoc.ma_bd, banDoc.trang_thai)}
                                    style={{
                                        padding: '6px 12px', backgroundColor: banDoc.trang_thai === 'Hoạt động' ? '#ffc107' : '#28a745',
                                        color: banDoc.trang_thai === 'Hoạt động' ? '#212529' : 'white', border: 'none', borderRadius: '4px',
                                        cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
                                    }}
                                >
                                    {banDoc.trang_thai === 'Hoạt động' ? '🔒 Khóa' : '🔓 Mở khóa'}
                                </button>
                                <button
                                    onClick={() => xoaBanDoc(banDoc.ma_bd)}
                                    style={{
                                        padding: '6px 12px', backgroundColor: '#dc3545', color: 'white',
                                        border: 'none', borderRadius: '4px', cursor: 'pointer',
                                        fontWeight: 'bold', fontSize: '12px', marginLeft: '8px'
                                    }}
                                >
                                    🗑️ Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                    {danhSachTrenTrang.length === 0 && (
                        <tr>
                            <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                                Không có dữ liệu hoặc không tìm thấy sinh viên nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* BƯỚC 5: THANH ĐIỀU HƯỚNG PHÂN TRANG */}
            {tongSoTrang > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                    <button
                        onClick={() => setTrangHienTai(trangHienTai - 1)}
                        disabled={trangHienTai === 1}
                        style={{ padding: '8px 12px', cursor: trangHienTai === 1 ? 'not-allowed' : 'pointer', borderRadius: '4px', border: '1px solid #dee2e6', backgroundColor: trangHienTai === 1 ? '#f8f9fa' : 'white' }}
                    >
                        ◀ Trước
                    </button>

                    <span style={{ fontWeight: 'bold', color: '#495057' }}>
                        Trang {trangHienTai} / {tongSoTrang}
                    </span>

                    <button
                        onClick={() => setTrangHienTai(trangHienTai + 1)}
                        disabled={trangHienTai === tongSoTrang}
                        style={{ padding: '8px 12px', cursor: trangHienTai === tongSoTrang ? 'not-allowed' : 'pointer', borderRadius: '4px', border: '1px solid #dee2e6', backgroundColor: trangHienTai === tongSoTrang ? '#f8f9fa' : 'white' }}
                    >
                        Sau ▶
                    </button>
                </div>
            )}
        </div>
    );
}

export default DanhSachBanDoc;