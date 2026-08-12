import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import * as XLSX from 'xlsx';

function QuanLySach() {
    // 1. STATE LƯU TRỮ DANH SÁCH TỪ BACKEND
    const [danhSachSach, setDanhSachSach] = useState([]);
    const [danhSachDauSach, setDanhSachDauSach] = useState([]);
    const [danhSachKeSach, setDanhSachKeSach] = useState([]);

    // 2. STATE FORM NHẬP LIỆU
    const [maSach, setMaSach] = useState('');

    // Lưu trữ Option đã chọn (đối tượng {value, label})
    const [chonDauSach, setChonDauSach] = useState(null);
    const [chonKeSach, setChonKeSach] = useState(null);

    const [tinhTrang, setTinhTrang] = useState('Mới'); // Giá trị mặc định
    const [trangThai, setTrangThai] = useState('Sẵn sàng'); // Giá trị mặc định

    const [tuKhoa, setTuKhoa] = useState('');
    const [duLieuNhapNhanh, setDuLieuNhapNhanh] = useState('');
    const [cheDoSua, setCheDoSua] = useState(false);

    // 3. TẢI DỮ LIỆU ĐỒNG LOẠT
    const layTatCaDuLieu = () => {
        axios.get('http://127.0.0.1:8000/sach').then(res => setDanhSachSach(res.data)).catch(err => console.log(err));
        axios.get('http://127.0.0.1:8000/dausach').then(res => setDanhSachDauSach(res.data)).catch(err => console.log(err));
        axios.get('http://127.0.0.1:8000/kesach').then(res => setDanhSachKeSach(res.data)).catch(err => console.log(err));
    };

    useEffect(() => {
        layTatCaDuLieu();
    }, []);

    // 4. CHUYỂN ĐỔI DỮ LIỆU CHO COMBOBOX (react-select)
    const optionsDauSach = danhSachDauSach.map(ds => ({ value: ds.MaDauSach, label: `${ds.MaDauSach} - ${ds.TenSach}` }));
    const optionsKeSach = danhSachKeSach.map(ks => ({ value: ks.MaKeSach, label: `${ks.MaKeSach} - ${ks.TenKeSach}` }));

    // 5. XỬ LÝ SỬA VÀ HỦY SỬA
    const xuLyBamSua = (sach) => {
        setMaSach(sach.MaSach);
        setTinhTrang(sach.TinhTrang || 'Mới');
        setTrangThai(sach.TrangThai || 'Sẵn sàng');

        // Tìm và gán lại Đầu sách đã chọn lên Combobox
        const dsTimThay = optionsDauSach.find(opt => opt.value === sach.MaDauSach);
        setChonDauSach(dsTimThay || null);

        // Tìm và gán lại Kệ sách đã chọn lên Combobox
        const ksTimThay = optionsKeSach.find(opt => opt.value === sach.MaKeSach);
        setChonKeSach(ksTimThay || null);

        setCheDoSua(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const xuLyHuySua = () => {
        setMaSach('');
        setChonDauSach(null);
        setChonKeSach(null);
        setTinhTrang('Mới');
        setTrangThai('Sẵn sàng');
        setCheDoSua(false);
    };

    // 6. XỬ LÝ LƯU (THÊM / CẬP NHẬT)
    const xuLyLuuForm = (e) => {
        e.preventDefault();
        // Kiểm tra bắt buộc nhập
        if (!maSach || !chonDauSach) {
            return alert("Vui lòng nhập Mã sách vật lý và Chọn Đầu Sách tương ứng!");
        }

        const duLieuGui = {
            MaSach: maSach,
            MaDauSach: chonDauSach.value, // Lấy giá trị ID ẩn bên dưới
            MaKe: chonKeSach ? chonKeSach.value : null,
            TinhTrang: tinhTrang,
            TrangThai: trangThai
        };

        const apiRequest = cheDoSua
            ? axios.put(`http://127.0.0.1:8000/sach/${duLieuGui.MaSach}`, duLieuGui)
            : axios.post('http://127.0.0.1:8000/sach', duLieuGui);

        apiRequest.then(() => {
            alert(cheDoSua ? "Cập nhật cuốn sách thành công!" : "Thêm cuốn sách vào kho thành công!");
            xuLyHuySua();
            layTatCaDuLieu();
        }).catch(err => alert(err.response?.data?.detail || "Lỗi xử lý API!"));
    };

    // 7. XÓA CUỐN SÁCH
    const xuLyXoa = (ma_sach) => {
        if (window.confirm(`Bạn có chắc muốn xóa cuốn sách mã ${ma_sach} khỏi kho?`)) {
            axios.delete(`http://127.0.0.1:8000/sach/${ma_sach}`)
                .then(() => {
                    alert("Đã xóa cuốn sách!");
                    if (cheDoSua && maSach === ma_sach) xuLyHuySua();
                    layTatCaDuLieu();
                }).catch(err => alert(err.response?.data?.detail || "Lỗi khi xóa!"));
        }
    };

    // 8. THÊM HÀNG LOẠT (VĂN BẢN)
    const xuLyThemHangLoat = () => {
        if (!duLieuNhapNhanh.trim()) return alert("Vui lòng nhập dữ liệu!");
        const dongList = duLieuNhapNhanh.split('\n');
        const danhSachGui = [];

        for (let dong of dongList) {
            if (!dong.trim()) continue;
            const pt = dong.split('|').map(s => s.trim());
            // Cần ít nhất Mã Sách và Mã Đầu Sách
            if (pt.length >= 2) {
                const parsedMaDauSach = parseInt(pt[1]);
                if (isNaN(parsedMaDauSach)) {
                    return alert(`Lỗi ở dòng: "${dong}". Mã Đầu Sách bắt buộc phải là SỐ!`);
                }
                danhSachGui.push({
                    MaSach: pt[0],
                    MaDauSach: parsedMaDauSach,
                    MaKe: pt[2] || null,
                    TinhTrang: pt[3] || 'Mới',
                    TrangThai: pt[4] || 'Sẵn sàng'
                });
            }
        }

        if (danhSachGui.length === 0) return;

        axios.post('http://127.0.0.1:8000/sach/hang-loat', danhSachGui)
            .then(res => { alert(res.data.thong_bao); setDuLieuNhapNhanh(''); layTatCaDuLieu(); })
            .catch(err => alert(err.response?.data?.detail || "Có lỗi xảy ra!"));
    };

    // 9. THÊM HÀNG LOẠT (EXCEL)
    const xuLyTaiFileExcel = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
            const danhSachGui = [];

            for (let i = 1; i < data.length; i++) {
                const row = data[i];
                if (row && row[0] && row[1]) {
                    const parsedMaDauSach = parseInt(row[1]);
                    if (!isNaN(parsedMaDauSach)) {
                        danhSachGui.push({
                            MaSach: String(row[0]).trim(),
                            MaDauSach: parsedMaDauSach,
                            MaKe: row[2] ? String(row[2]).trim() : null,
                            TinhTrang: row[3] ? String(row[3]).trim() : 'Mới',
                            TrangThai: row[4] ? String(row[4]).trim() : 'Sẵn sàng'
                        });
                    }
                }
            }
            if (danhSachGui.length === 0) return alert("File Excel không hợp lệ (Mã Đầu Sách phải là số)!");

            axios.post('http://127.0.0.1:8000/sach/hang-loat', danhSachGui)
                .then(res => { alert(res.data.thong_bao); layTatCaDuLieu(); })
                .catch(() => alert("Lỗi nhập tệp!"));
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    // 10. BỘ LỌC TÌM KIẾM
    const danhSachDaLoc = danhSachSach.filter(s =>
        s.TenSach?.toLowerCase().includes(tuKhoa.toLowerCase()) ||
        s.MaSach.toLowerCase().includes(tuKhoa.toLowerCase())
    );

    // ================= GIAO DIỆN CHÍNH =================
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-in' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
                {/* CỘT TRÁI: FORM */}
                <div style={{ flex: '1', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: cheDoSua ? '#ffc107' : '#28a745', borderBottom: `2px solid ${cheDoSua ? '#ffc107' : '#28a745'}`, paddingBottom: '10px' }}>
                        {cheDoSua ? '✏️ Cập Nhật Sách' : '📗 Nhập Kho Sách'}
                    </h3>
                    <form onSubmit={xuLyLuuForm}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Mã Sách (Barcode/Mã vật lý):</label>
                            <input
                                type="text"
                                value={maSach}
                                onChange={e => setMaSach(e.target.value)}
                                disabled={cheDoSua}
                                placeholder="Ví dụ: S001"
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: cheDoSua ? '#e9ecef' : 'white', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Thuộc Đầu Sách:</label>
                            <Select
                                isSearchable
                                options={optionsDauSach}
                                value={chonDauSach}
                                onChange={setChonDauSach}
                                placeholder="Gõ tên đầu sách..."
                                noOptionsMessage={() => "Không tìm thấy Đầu sách"}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Xếp vào Kệ Sách:</label>
                            <Select
                                isSearchable
                                options={optionsKeSach}
                                value={chonKeSach}
                                onChange={setChonKeSach}
                                placeholder="Gõ tên kệ sách..."
                                isClearable // Cho phép bấm X xóa để kệ rỗng
                                noOptionsMessage={() => "Không tìm thấy Kệ sách"}
                            />
                        </div>

                        <div style={{ marginBottom: '15px', display: 'flex', gap: '15px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Tình trạng vật lý:</label>
                                <select
                                    value={tinhTrang}
                                    onChange={e => setTinhTrang(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="Mới">Mới</option>
                                    <option value="Cũ (Tốt)">Cũ (Tốt)</option>
                                    <option value="Sờn rách nhẹ">Sờn rách nhẹ</option>
                                    <option value="Hư hỏng nặng">Hư hỏng nặng</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Trạng thái kho:</label>
                                <select
                                    value={trangThai}
                                    onChange={e => setTrangThai(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="Sẵn sàng">Sẵn sàng</option>
                                    <option value="Đã mượn">Đã mượn</option>
                                    <option value="Bảo trì/Chờ sửa">Bảo trì/Chờ sửa</option>
                                    <option value="Báo mất">Báo mất</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button type="submit" style={{ flex: '1', padding: '10px', backgroundColor: cheDoSua ? '#ffc107' : '#28a745', color: cheDoSua ? 'black' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                {cheDoSua ? 'Lưu Thay Đổi' : 'Nhập Kho'}
                            </button>
                            {cheDoSua && (
                                <button type="button" onClick={xuLyHuySua} style={{ flex: '1', padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Hủy Bỏ</button>
                            )}
                        </div>
                    </form>
                </div>

                {/* CỘT PHẢI: BẢNG */}
                <div style={{ flex: '2', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0 }}>Kho Sách Vật Lý</h3>
                        <input type="text" value={tuKhoa} onChange={e => setTuKhoa(e.target.value)} placeholder="🔍 Tìm kiếm mã hoặc tên..." style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', width: '220px' }} />
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ padding: '10px', borderBottom: '2px solid #dee2e6' }}>Mã Sách</th>
                                <th style={{ padding: '10px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Tên Đầu Sách</th>
                                <th style={{ padding: '10px', borderBottom: '2px solid #dee2e6' }}>Vị Trí / Trạng Thái</th>
                                <th style={{ padding: '10px', borderBottom: '2px solid #dee2e6' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {danhSachDaLoc.map((s, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #e9ecef', backgroundColor: (cheDoSua && maSach === s.MaSach) ? '#fff3cd' : 'transparent' }}>
                                    <td style={{ padding: '10px', textAlign: 'center' }}><strong>{s.MaSach}</strong></td>
                                    <td style={{ padding: '10px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{s.TenSach}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>Tình trạng: {s.TinhTrang}</div>
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center', fontSize: '13px' }}>
                                        <div>🗄️ {s.TenKeSach}</div>
                                        <div style={{ marginTop: '4px', color: s.TrangThai === 'Sẵn sàng' ? 'green' : 'red', fontWeight: 'bold' }}>
                                            {s.TrangThai}
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <button onClick={() => xuLyBamSua(s)} style={{ padding: '5px 10px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '12px' }}>✏️</button>
                                        <button onClick={() => xuLyXoa(s.MaSach)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* KHỐI THÊM HÀNG LOẠT */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#007bff', borderBottom: '2px solid #007bff', paddingBottom: '10px', marginTop: 0 }}>📦 Nhập Kho Hàng Loạt</h3>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: '1' }}>
                        <p style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>Cách 1: Nhập văn bản (<code>Mã Sách | Mã Đầu Sách (Số) | Mã Kệ | Tình Trạng | Trạng Thái</code>).</p>
                        <textarea rows="3" value={duLieuNhapNhanh} onChange={e => setDuLieuNhapNhanh(e.target.value)} placeholder="S001 | 1 | KS01 | Mới | Sẵn sàng" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', fontFamily: 'monospace' }} />
                        <button onClick={xuLyThemHangLoat} style={{ marginTop: '8px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🚀 Nhập Kho Từ Văn Bản</button>
                    </div>
                    <div style={{ flex: '1', borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
                        <p style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>Cách 2: Tải lên tệp Excel (.xlsx). <br /><i>(Cột A: Mã Sách, B: Mã Đầu Sách, C: Mã Kệ, D: Tình trạng, E: Trạng thái)</i></p>
                        <input type="file" accept=".xlsx, .xls, .csv" onChange={xuLyTaiFileExcel} style={{ padding: '8px', border: '1px dashed #007bff', borderRadius: '4px', width: '100%', boxSizing: 'border-box', cursor: 'pointer', backgroundColor: '#f0f8ff' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuanLySach;