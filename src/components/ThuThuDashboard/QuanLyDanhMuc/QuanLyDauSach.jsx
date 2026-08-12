import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import * as XLSX from 'xlsx';

function QuanLyDauSach() {
    // 1. STATE LƯU TRỮ DANH SÁCH GỐC
    const [danhSachDauSach, setDanhSachDauSach] = useState([]);
    const [danhSachTacGia, setDanhSachTacGia] = useState([]);
    const [danhSachTheLoai, setDanhSachTheLoai] = useState([]);
    const [danhSachNXB, setDanhSachNXB] = useState([]);

    // 2. STATE FORM NHẬP LIỆU
    const [maDauSach, setMaDauSach] = useState('');
    const [tenSach, setTenSach] = useState('');
    const [chonTacGia, setChonTacGia] = useState([]);
    const [chonTheLoai, setChonTheLoai] = useState([]);
    const [chonNXB, setChonNXB] = useState([]);

    const [tuKhoa, setTuKhoa] = useState('');
    const [duLieuNhapNhanh, setDuLieuNhapNhanh] = useState('');
    const [cheDoSua, setCheDoSua] = useState(false);

    // 3. TẢI DỮ LIỆU
    const layTatCaDuLieu = () => {
        axios.get('http://127.0.0.1:8000/dausach').then(res => setDanhSachDauSach(res.data)).catch(err => console.log(err));
        axios.get('http://127.0.0.1:8000/tacgia').then(res => setDanhSachTacGia(res.data)).catch(err => console.log(err));
        axios.get('http://127.0.0.1:8000/theloai').then(res => setDanhSachTheLoai(res.data)).catch(err => console.log(err));
        axios.get('http://127.0.0.1:8000/nxb').then(res => setDanhSachNXB(res.data)).catch(err => console.log(err));
    };

    useEffect(() => {
        layTatCaDuLieu();
    }, []);

    // 4. CHUYỂN ĐỔI OPTION CHO REACT-SELECT
    const optionsTacGia = danhSachTacGia.map(tg => ({ value: tg.MaTacGia, label: tg.TenTacGia }));
    const optionsTheLoai = danhSachTheLoai.map(tl => ({ value: tl.MaTheLoai, label: tl.TenTheLoai }));
    const optionsNXB = danhSachNXB.map(nxb => ({ value: nxb.MaNXB, label: nxb.TenNXB }));

    // 5. XỬ LÝ SỬA VÀ HỦY SỬA
    const xuLyBamSua = (ds) => {
        setMaDauSach(ds.MaDauSach);
        setTenSach(ds.TenSach);
        // Map dữ liệu từ Backend thành chuẩn {value, label} của react-select
        setChonTacGia((ds.tac_gia || []).map(tg => ({ value: tg.MaTacGia, label: tg.TenTacGia })));
        setChonTheLoai((ds.the_loai || []).map(tl => ({ value: tl.MaTheLoai, label: tl.TenTheLoai })));
        setChonNXB((ds.nha_xuat_ban || []).map(nxb => ({ value: nxb.MaNXB, label: nxb.TenNXB })));

        setCheDoSua(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const xuLyHuySua = () => {
        setMaDauSach(''); setTenSach('');
        setChonTacGia([]); setChonTheLoai([]); setChonNXB([]);
        setCheDoSua(false);
    };

    // 6. XỬ LÝ LƯU (THÊM / CẬP NHẬT)
    const xuLyLuuForm = (e) => {
        e.preventDefault();
        if (!maDauSach || !tenSach) return alert("Vui lòng nhập đủ Mã và Tên sách!");

        const duLieuGui = {
            MaDauSach: parseInt(maDauSach),
            TenSach: tenSach,
            DanhSachMaTacGia: chonTacGia.map(item => item.value),
            DanhSachMaTheLoai: chonTheLoai.map(item => item.value),
            DanhSachMaNXB: chonNXB.map(item => parseInt(item.value))
        };

        const apiRequest = cheDoSua
            ? axios.put(`http://127.0.0.1:8000/dausach/${duLieuGui.MaDauSach}`, duLieuGui)
            : axios.post('http://127.0.0.1:8000/dausach', duLieuGui);

        apiRequest.then(() => {
            alert(cheDoSua ? "Cập nhật thành công!" : "Thêm Đầu sách thành công!");
            xuLyHuySua();
            layTatCaDuLieu();
        }).catch(err => alert(err.response?.data?.detail || "Lỗi xử lý!"));
    };

    // 7. XÓA ĐẦU SÁCH
    const xuLyXoa = (ma_ds) => {
        if (window.confirm(`Xóa Đầu sách mã ${ma_ds}?`)) {
            axios.delete(`http://127.0.0.1:8000/dausach/${ma_ds}`)
                .then(() => {
                    alert("Đã xóa!");
                    if (cheDoSua && parseInt(maDauSach) === ma_ds) xuLyHuySua();
                    layTatCaDuLieu();
                }).catch(err => alert(err.response?.data?.detail || "Lỗi!"));
        }
    };

    // 8. THÊM HÀNG LOẠT (Hàm hỗ trợ xử lý chuỗi phân cách bằng dấu phẩy)
    const xuLyThemHangLoat = () => {
        if (!duLieuNhapNhanh.trim()) return alert("Vui lòng nhập dữ liệu!");
        const dongList = duLieuNhapNhanh.split('\n');
        const danhSachGui = [];

        for (let dong of dongList) {
            if (!dong.trim()) continue;
            const pt = dong.split('|').map(s => s.trim());
            if (pt.length >= 2) {
                danhSachGui.push({
                    MaDauSach: parseInt(pt[0]) || 0,
                    TenSach: pt[1],
                    // Tách chuỗi bằng dấu phẩy, lọc bỏ phần tử rỗng
                    DanhSachMaTacGia: pt[2] ? pt[2].split(',').map(s => s.trim()).filter(s => s) : [],
                    DanhSachMaTheLoai: pt[3] ? pt[3].split(',').map(s => s.trim()).filter(s => s) : [],
                    DanhSachMaNXB: pt[4] ? pt[4].split(',').map(s => parseInt(s.trim())).filter(s => !isNaN(s)) : []
                });
            }
        }

        axios.post('http://127.0.0.1:8000/dausach/hang-loat', danhSachGui)
            .then(res => { alert(res.data.thong_bao); setDuLieuNhapNhanh(''); layTatCaDuLieu(); })
            .catch(err => alert(err.response?.data?.detail || "Có lỗi xảy ra!"));
    };

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
                    danhSachGui.push({
                        MaDauSach: parseInt(row[0]) || 0,
                        TenSach: String(row[1]).trim(),
                        DanhSachMaTacGia: row[2] ? String(row[2]).split(',').map(s => s.trim()).filter(s => s) : [],
                        DanhSachMaTheLoai: row[3] ? String(row[3]).split(',').map(s => s.trim()).filter(s => s) : [],
                        DanhSachMaNXB: row[4] ? String(row[4]).split(',').map(s => parseInt(s.trim())).filter(s => !isNaN(s)) : []
                    });
                }
            }
            axios.post('http://127.0.0.1:8000/dausach/hang-loat', danhSachGui)
                .then(res => { alert(res.data.thong_bao); layTatCaDuLieu(); })
                .catch(() => alert("Lỗi nhập tệp!"));
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    const danhSachDaLoc = danhSachDauSach.filter(ds =>
        ds.TenSach?.toLowerCase().includes(tuKhoa.toLowerCase()) || String(ds.MaDauSach).includes(tuKhoa)
    );

    // ================= GIAO DIỆN CHÍNH =================
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-in' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
                {/* CỘT TRÁI: FORM */}
                <div style={{ flex: '1', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: cheDoSua ? '#ffc107' : '#17a2b8', borderBottom: `2px solid ${cheDoSua ? '#ffc107' : '#17a2b8'}`, paddingBottom: '10px' }}>
                        {cheDoSua ? '✏️ Cập Nhật Đầu Sách' : '📘 Thêm Đầu Sách'}
                    </h3>
                    <form onSubmit={xuLyLuuForm}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold' }}>Mã Sách (Số):</label>
                            <input type="number" value={maDauSach} onChange={e => setMaDauSach(e.target.value)} disabled={cheDoSua} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: cheDoSua ? '#e9ecef' : 'white' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold' }}>Tên Sách:</label>
                            <input type="text" value={tenSach} onChange={e => setTenSach(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold' }}>Tác Giả:</label>
                            <Select isMulti isSearchable options={optionsTacGia} value={chonTacGia} onChange={setChonTacGia} placeholder="Tìm tác giả..." />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold' }}>Thể Loại:</label>
                            <Select isMulti isSearchable options={optionsTheLoai} value={chonTheLoai} onChange={setChonTheLoai} placeholder="Tìm thể loại..." />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold' }}>Nhà Xuất Bản:</label>
                            <Select isMulti isSearchable options={optionsNXB} value={chonNXB} onChange={setChonNXB} placeholder="Tìm NXB..." />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" style={{ flex: '1', padding: '10px', backgroundColor: cheDoSua ? '#ffc107' : '#17a2b8', color: cheDoSua ? 'black' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                {cheDoSua ? 'Lưu Thay Đổi' : 'Lưu Đầu Sách'}
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
                        <h3 style={{ margin: 0 }}>Danh sách Đầu Sách</h3>
                        <input type="text" value={tuKhoa} onChange={e => setTuKhoa(e.target.value)} placeholder="🔍 Tìm kiếm..." style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ padding: '10px', borderBottom: '2px solid #dee2e6' }}>Mã</th>
                                <th style={{ padding: '10px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Tên Sách</th>
                                <th style={{ padding: '10px', borderBottom: '2px solid #dee2e6' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {danhSachDaLoc.map((ds, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #e9ecef', backgroundColor: (cheDoSua && parseInt(maDauSach) === ds.MaDauSach) ? '#fff3cd' : 'transparent' }}>
                                    <td style={{ padding: '10px', textAlign: 'center' }}><strong>{ds.MaDauSach}</strong></td>
                                    <td style={{ padding: '10px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{ds.TenSach}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            TG: {ds.tac_gia?.map(t => t.TenTacGia).join(', ') || '---'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <button onClick={() => xuLyBamSua(ds)} style={{ padding: '5px 10px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '12px' }}>✏️ Sửa</button>
                                        <button onClick={() => xuLyXoa(ds.MaDauSach)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>🗑️ Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* KHỐI THÊM HÀNG LOẠT */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#28a745', borderBottom: '2px solid #28a745', paddingBottom: '10px', marginTop: 0 }}>📦 Thêm Đầu Sách Hàng Loạt</h3>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: '1' }}>
                        <p style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>Cách 1: Nhập văn bản (<code>Mã | Tên | Mã Tác Giả | Mã Thể Loại | Mã NXB</code>). <br /><i>(Nhiều mã thì cách nhau bằng dấu phẩy)</i></p>
                        <textarea rows="3" value={duLieuNhapNhanh} onChange={e => setDuLieuNhapNhanh(e.target.value)} placeholder="1 | Đắc Nhân Tâm | TG01, TG02 | TL01 | 1" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', fontFamily: 'monospace' }} />
                        <button onClick={xuLyThemHangLoat} style={{ marginTop: '8px', padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🚀 Thêm Từ Văn Bản</button>
                    </div>
                    <div style={{ flex: '1', borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
                        <p style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>Cách 2: Tải lên tệp Excel (.xlsx). <br /><i>(Cột A: Mã Sách, B: Tên, C: Các Mã TG, D: Các Mã TL, E: Các Mã NXB)</i></p>
                        <input type="file" accept=".xlsx, .xls, .csv" onChange={xuLyTaiFileExcel} style={{ padding: '8px', border: '1px dashed #28a745', borderRadius: '4px', width: '100%', boxSizing: 'border-box', cursor: 'pointer', backgroundColor: '#f8fff9' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuanLyDauSach;