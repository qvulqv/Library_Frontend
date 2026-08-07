import { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess }) {
  // Các biến lưu trữ dữ liệu người dùng nhập vào
  const [tenDangNhap, setTenDangNhap] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loi, setLoi] = useState(''); // Biến lưu thông báo lỗi nếu nhập sai

  // Hàm chạy khi người dùng bấm nút Đăng nhập
  const xuLyDangNhap = (e) => {
    e.preventDefault(); // Ngăn trình duyệt tự động tải lại trang
    setLoi(''); // Xóa lỗi cũ trước khi gửi yêu cầu mới

    // Gửi dữ liệu sang Backend
    axios.post('http://127.0.0.1:8000/dang-nhap', {
      TenDangNhap: tenDangNhap,
      MatKhau: matKhau
    })
    .then((phanHoi) => {
      // Đăng nhập thành công: Lưu vai trò vào bộ nhớ của trình duyệt
      const vaiTro = phanHoi.data.vai_tro;
      localStorage.setItem('vaiTro', vaiTro);
      
      // Kích hoạt hàm báo cáo lên App.jsx rằng đã đăng nhập xong
      onLoginSuccess(vaiTro);
    })
    .catch((error) => {
      // Đăng nhập thất bại (sai mật khẩu/tài khoản)
      setLoi('Tên đăng nhập hoặc mật khẩu không chính xác!');
    });
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
      <h2>Đăng Nhập Thư Viện</h2>
      
      {/* Vùng hiển thị lỗi màu đỏ nếu có */}
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