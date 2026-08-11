import { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess }) {
    const [tenDangNhap, setTenDangNhap] = useState('');
    const [matKhau, setMatKhau] = useState('');
    const [loi, setLoi] = useState('');

    const xuLyDangNhap = (e) => {
        e.preventDefault();
        setLoi('');

        axios.post('http://127.0.0.1:8000/dang-nhap', {
            TenDangNhap: tenDangNhap,
            MatKhau: matKhau
        })
            .then((phanHoi) => {
                // Chỉ lấy vai trò từ backend
                const vaiTro = phanHoi.data.vai_tro;

                // Lưu trực tiếp biến state tenDangNhap vào bộ nhớ
                localStorage.setItem('vaiTro', vaiTro);
                localStorage.setItem('tenDangNhap', tenDangNhap);

                // Gửi CẢ 2 tham số lên tệp App.jsx
                onLoginSuccess(vaiTro, tenDangNhap);
            })
            .catch((error) => {
                console.error("Nhật ký lỗi chi tiết:", error);

                if (error.response) {
                    // Trường hợp 1: Backend nhận được dữ liệu nhưng từ chối (ví dụ: sai mật khẩu, lỗi code 500)
                    setLoi(`Máy chủ từ chối: Lỗi ${error.response.status}`);
                } else if (error.request) {
                    // Trường hợp 2: Bị trình duyệt chặn (CORS) hoặc Backend chưa mở đúng cổng
                    setLoi('Lỗi mạng: Không thể kết nối đến máy chủ Backend!');
                } else {
                    // Trường hợp 3: Lỗi phát sinh từ chính React
                    setLoi('Đã xảy ra sự cố trên giao diện!');
                }
            });
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
            <h2>Đăng Nhập Thư Viện</h2>

            {loi && <p style={{ color: 'red' }}>{loi}</p>}

            <form onSubmit={xuLyDangNhap}>
                <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Tên đăng nhập:</label>
                    <input
                        type="text"
                        value={tenDangNhap}
                        onChange={(e) => setTenDangNhap(e.target.value)}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Mật khẩu:</label>
                    <input
                        type="password"
                        value={matKhau}
                        onChange={(e) => setMatKhau(e.target.value)}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Đăng Nhập
                </button>
            </form>
        </div>
    );
}

export default Login;