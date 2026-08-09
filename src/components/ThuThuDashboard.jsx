import { useState } from 'react';

function ThuThuDashboard() {
  // Biến này dùng để ghi nhớ xem thủ thư đang chọn chức năng nào
  const [chucNangDangChon, setChucNangDangChon] = useState('');

  const styleNutBam = {
    padding: '10px 15px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Bảng Điều Khiển Của Thủ Thư</h2>
      
      {/* Khu vực Menu chứa các nút bấm */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button style={styleNutBam} onClick={() => setChucNangDangChon('ThongKe')}>Thống kê</button>
        <button style={styleNutBam} onClick={() => setChucNangDangChon('MuonTra')}>Quản lý Mượn / Trả</button>
        <button style={styleNutBam} onClick={() => setChucNangDangChon('KhoSach')}>Quản lý Kho sách</button>
        <button style={styleNutBam} onClick={() => setChucNangDangChon('Phat')}>Quản lý Phạt</button>
        <button style={styleNutBam} onClick={() => setChucNangDangChon('BanDoc')}>Quản lý Bạn đọc</button>
      </div>

      {/* Khu vực Nội dung thay đổi dựa theo nút được bấm */}
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', minHeight: '300px', backgroundColor: '#f9f9f9' }}>
        {chucNangDangChon === '' && <h3>Vui lòng chọn một chức năng từ menu bên trên để bắt đầu làm việc.</h3>}
        {chucNangDangChon === 'ThongKe' && <h3>Biểu đồ và số liệu thống kê sẽ hiển thị ở đây.</h3>}
        {chucNangDangChon === 'MuonTra' && <h3>Giao diện duyệt phiếu và mượn trả sách sẽ hiển thị ở đây.</h3>}
        {chucNangDangChon === 'KhoSach' && <h3>Bảng danh sách sách và tồn kho sẽ hiển thị ở đây.</h3>}
        {chucNangDangChon === 'Phat' && <h3>Giao diện xử lý vi phạm và in phiếu phạt sẽ hiển thị ở đây.</h3>}
        {chucNangDangChon === 'BanDoc' && <h3>Bảng danh sách tài khoản sinh viên sẽ hiển thị ở đây.</h3>}
      </div>
    </div>
  );
}

export default ThuThuDashboard;