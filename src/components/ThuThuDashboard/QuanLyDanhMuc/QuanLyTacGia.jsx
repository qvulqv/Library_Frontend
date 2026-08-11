import { useState, useEffect } from 'react';
import axios from 'axios';

function QuanLyTacGia() {
    const [danhSachTacGia, setDanhSachTacGia] = useState([]);
    const [maTacGia, setMaTacGia] = useState('');
    const [tenTacGia, setTenTacGia] = useState('');

    const layDuLieuTacGia = () => {
        axios.get('http://127.0.0.1:8000/tacgia')
            .then(res => setDanhSachTacGia(res.data))
            .catch(() => alert("Lỗi tải dữ liệu tác giả!"));
    };

    useEffect(() => {
        layDuLieuTacGia();
    }, []);

    const xuLyThem = (e) => {
        e.preventDefault();
        if (!maTacGia || !tenTacGia) {
            alert("Vui lòng nhập đầy đủ Mã và Tên tác giả!");
            return;
        }

        axios.post('http://127.0.0.1:8000/tacgia', {
            MaTacGia: maTacGia,
            TenTacGia: tenTacGia
        })
            .then(() => {
                alert("Thêm tác giả thành công!");
                setMaTacGia('');
                setTenTacGia('');
                layDuLieuTacGia(); // Cập nhật lại bảng
            })
            .catch(err => {
                alert(err.response?.data?.detail || "Lỗi khi thêm tác giả!");
            });
    };

    const xuLyXoa = (ma_tg) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa tác giả mã ${ma_tg} không?`)) {
            axios.delete(`http://127.0.0.1:8000/tacgia/${ma_tg}`)
                .then(() => {
                    alert("Đã xóa tác giả!");
                    layDuLieuTacGia();
                })
                .catch(err => alert(err.response?.data?.detail || "Đã có lỗi xảy ra!"));
        }
    };

    return (
        <div style={{ display: 'flex', gap: '20px', animation: 'fadeIn 0.3s ease-in' }}>
            {/* Cột trái: Form thêm mới */}
            <div style={{ flex: '1', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', alignSelf: 'flex-start' }}>
                <h3 style={{ color: '#17a2b8', borderBottom: '2px solid #17a2b8', paddingBottom: '10px' }}>✍️ Thêm Tác Giả</h3>
                <form onSubmit={xuLyThem}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Mã Tác Giả:</label>
                        <input type="text" value={maTacGia} onChange={e => setMaTacGia(e.target.value)} placeholder="Ví dụ: TG01" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Tên Tác Giả:</label>
                        <input type="text" value={tenTacGia} onChange={e => setTenTacGia(e.target.value)} placeholder="Ví dụ: Nguyễn Nhật Ánh" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Lưu Tác Giả
                    </button>
                </form>
            </div>

            {/* Cột phải: Bảng danh sách */}
            <div style={{ flex: '2', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#333', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>Danh sách Tác giả</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                            <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Mã Tác Giả</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Tên Tác Giả</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {danhSachTacGia.map((tg, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #e9ecef' }}>
                                <td style={{ padding: '12px', textAlign: 'center' }}><strong>{tg.MaTacGia}</strong></td>
                                <td style={{ padding: '12px' }}>{tg.TenTacGia}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <button
                                        onClick={() => xuLyXoa(tg.MaTacGia)}
                                        style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                        🗑️ Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {danhSachTacGia.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>Chưa có dữ liệu tác giả.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default QuanLyTacGia;