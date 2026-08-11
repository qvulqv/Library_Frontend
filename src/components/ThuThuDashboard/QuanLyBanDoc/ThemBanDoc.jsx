import { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; // Import thư viện đọc Excel

function ThemBanDoc() {
    // Biến cho form nhập tay
    const [maSV, setMaSV] = useState('');
    const [hoTenDem, setHoTenDem] = useState('');
    const [ten, setTen] = useState('');
    const [sdt, setSdt] = useState('');
    const [email, setEmail] = useState('');

    // Biến thông báo chung
    const [thongBao, setThongBao] = useState({ loai: '', noiDung: '' });

    // HÀM 1: Xử lý nhập tay (Giữ nguyên như cũ)
    const xuLyLuuBanDoc = (e) => {
        e.preventDefault();
        setThongBao({ loai: '', noiDung: '' });

        if (!maSV || !hoTenDem || !ten) {
            setThongBao({ loai: 'loi', noiDung: 'Vui lòng nhập đầy đủ Mã SV, Họ đệm và Tên!' });
            return;
        }

        axios.post('http://127.0.0.1:8000/bandoc', {
            MaBanDoc: maSV, HoTenDem: hoTenDem, Ten: ten, SDT: sdt, Email: email
        })
            .then((phanHoi) => {
                setThongBao({ loai: 'thanhCong', noiDung: phanHoi.data.thong_bao });
                setMaSV(''); setHoTenDem(''); setTen(''); setSdt(''); setEmail('');
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    setThongBao({ loai: 'loi', noiDung: error.response.data.detail });
                } else {
                    setThongBao({ loai: 'loi', noiDung: 'Không thể kết nối đến máy chủ!' });
                }
            });
    };

    // HÀM 2: Xử lý file Excel
    const xuLyTaiExcel = (e) => {
        const file = e.target.files[0];
        if (!file) return; // Nếu người dùng hủy chọn file thì không làm gì cả

        setThongBao({ loai: '', noiDung: 'Đang xử lý tệp Excel...' });

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                // Đọc dữ liệu từ file Excel
                const data = evt.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });

                // Lấy dữ liệu ở trang tính (Sheet) đầu tiên
                const tenTrangTinh = workbook.SheetNames[0];
                const trangTinh = workbook.Sheets[tenTrangTinh];
                const duLieuTho = XLSX.utils.sheet_to_json(trangTinh);

                // Chuyển đổi tên cột Excel thành đúng định dạng API yêu cầu
                const danhSachDinhDang = duLieuTho.map(dong => ({
                    MaBanDoc: String(dong['Mã SV'] || ''),
                    HoTenDem: String(dong['Họ Tên Đệm'] || ''),
                    Ten: String(dong['Tên'] || ''),
                    SDT: String(dong['SĐT'] || ''),
                    Email: String(dong['Email'] || '')
                })).filter(sv => sv.MaBanDoc !== '' && sv.Ten !== ''); // Lọc bỏ các dòng trống

                if (danhSachDinhDang.length === 0) {
                    setThongBao({ loai: 'loi', noiDung: 'Tệp Excel trống hoặc sai định dạng tiêu đề cột!' });
                    return;
                }

                // Gửi danh sách lên Backend
                axios.post('http://127.0.0.1:8000/bandoc/hang-loat', danhSachDinhDang)
                    .then((phanHoi) => {
                        const loi = phanHoi.data.loi;
                        let loiThongBao = '';
                        if (loi && loi.length > 0) {
                            loiThongBao = ` (Bỏ qua ${loi.length} sinh viên bị trùng mã).`;
                        }
                        setThongBao({ loai: 'thanhCong', noiDung: phanHoi.data.thong_bao + loiThongBao });
                    })
                    .catch((error) => {
                        setThongBao({ loai: 'loi', noiDung: 'Lỗi khi lưu dữ liệu từ Excel lên máy chủ!' });
                    });

            } catch (error) {
                setThongBao({ loai: 'loi', noiDung: 'Đã có lỗi xảy ra khi đọc tệp Excel. Vui lòng kiểm tra lại định dạng tệp.' });
            }
        };

        reader.readAsBinaryString(file);
        e.target.value = null; // Đặt lại ô chọn file để có thể chọn lại chính file đó nếu cần
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-in', maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '20px' }}>

            {/* Cột trái: Nhập tay */}
            <div style={{ flex: 1, backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#28a745', marginBottom: '20px', borderBottom: '2px solid #28a745', paddingBottom: '10px' }}>
                    ➕ Thêm Một Bạn Đọc
                </h3>

                <form onSubmit={xuLyLuuBanDoc}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Mã Sinh Viên (*):</label>
                        <input type="text" value={maSV} onChange={(e) => setMaSV(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                        <div style={{ flex: 2 }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Họ và Tên đệm (*):</label>
                            <input type="text" value={hoTenDem} onChange={(e) => setHoTenDem(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Tên (*):</label>
                            <input type="text" value={ten} onChange={(e) => setTen(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Số điện thoại:</label>
                        <input type="text" value={sdt} onChange={(e) => setSdt(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email:</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>

                    <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
                        💾 Lưu Bạn Đọc
                    </button>
                </form>
            </div>

            {/* Cột phải: Thêm từ Excel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', flex: 1 }}>
                    <h3 style={{ color: '#007bff', marginBottom: '20px', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
                        📁 Nhập Hàng Loạt Từ Excel
                    </h3>

                    <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.5' }}>
                        Vui lòng chuẩn bị tệp Excel (.xlsx) với các cột tiêu đề theo đúng thứ tự:
                        <strong> Mã SV, Họ Tên Đệm, Tên, SĐT, Email</strong>.
                    </p>

                    <label style={{
                        display: 'block', width: '100%', padding: '20px', border: '2px dashed #007bff', borderRadius: '8px',
                        textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8f9fa', boxSizing: 'border-box'
                    }}>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>📥</div>
                        <strong style={{ color: '#007bff' }}>Nhấp vào đây để chọn tệp Excel</strong>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={xuLyTaiExcel}
                            style={{ display: 'none' }} // Ẩn nút chọn file xấu xí mặc định đi
                        />
                    </label>
                </div>

                {/* Khu vực hiển thị thông báo nằm dưới cùng cột phải */}
                {thongBao.noiDung && (
                    <div style={{
                        marginTop: '20px', padding: '15px', borderRadius: '4px', borderLeft: `5px solid ${thongBao.loai === 'loi' ? '#dc3545' : '#28a745'}`,
                        backgroundColor: thongBao.loai === 'loi' ? '#f8d7da' : '#d4edda',
                        color: thongBao.loai === 'loi' ? '#721c24' : '#155724',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        {thongBao.noiDung}
                    </div>
                )}
            </div>

        </div>
    );
}

export default ThemBanDoc;