import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function QuanLyTacGia() {
    // 1. CÁC STATE LƯU TRỮ DỮ LIỆU
    const [danhSachTacGia, setDanhSachTacGia] = useState([]);
    const [maTacGia, setMaTacGia] = useState('');
    const [tenTacGia, setTenTacGia] = useState('');
    const [tuKhoa, setTuKhoa] = useState('');
    const [duLieuNhapNhanh, setDuLieuNhapNhanh] = useState('');
    const [cheDoSua, setCheDoSua] = useState(false);

    // 2. TẢI DỮ LIỆU TỪ API
    const layDuLieuTacGia = () => {
        axios.get('http://127.0.0.1:8000/tacgia')
            .then(res => setDanhSachTacGia(res.data))
            .catch(() => alert("Lỗi tải dữ liệu tác giả!"));
    };

    useEffect(() => {
        layDuLieuTacGia();
    }, []);

    // 3. XỬ LÝ CHẾ ĐỘ SỬA
    const xuLyBamSua = (tacGia) => {
        setMaTacGia(tacGia.MaTacGia);
        setTenTacGia(tacGia.TenTacGia);
        setCheDoSua(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const xuLyHuySua = () => {
        setMaTacGia('');
        setTenTacGia('');
        setCheDoSua(false);
    };

    // 4. XỬ LÝ LƯU (THÊM / CẬP NHẬT)
    const xuLyLuuForm = (e) => {
        e.preventDefault();
        if (!maTacGia || !tenTacGia) {
            alert("Vui lòng nhập đầy đủ Mã và Tên tác giả!");
            return;
        }

        if (cheDoSua) {
            axios.put(`http://127.0.0.1:8000/tacgia/${maTacGia}`, {
                MaTacGia: maTacGia,
                TenTacGia: tenTacGia
            })
                .then(() => {
                    alert("Cập nhật tác giả thành công!");
                    xuLyHuySua();
                    layDuLieuTacGia();
                })
                .catch(err => alert(err.response?.data?.detail || "Lỗi khi cập nhật!"));
        } else {
            axios.post('http://127.0.0.1:8000/tacgia', {
                MaTacGia: maTacGia,
                TenTacGia: tenTacGia
            })
                .then(() => {
                    alert("Thêm tác giả thành công!");
                    setMaTacGia(''); setTenTacGia('');
                    layDuLieuTacGia();
                })
                .catch(err => alert(err.response?.data?.detail || "Lỗi khi thêm!"));
        }
    };

    // 5. XỬ LÝ XÓA
    const xuLyXoa = (ma_tg) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa tác giả mã ${ma_tg} không?`)) {
            axios.delete(`http://127.0.0.1:8000/tacgia/${ma_tg}`)
                .then(() => {
                    alert("Đã xóa tác giả!");
                    if (cheDoSua && maTacGia === ma_tg) xuLyHuySua();
                    layDuLieuTacGia();
                })
                .catch(err => alert(err.response?.data?.detail || "Đã có lỗi xảy ra!"));
        }
    };

    // 6. XỬ LÝ THÊM HÀNG LOẠT (VĂN BẢN)
    const xuLyThemHangLoat = () => {
        if (!duLieuNhapNhanh.trim()) return alert("Vui lòng nhập dữ liệu để thêm hàng loạt!");

        const dongList = duLieuNhapNhanh.split('\n');
        const danhSachGui = [];

        for (let dong of dongList) {
            if (!dong.trim()) continue;
            const phanTich = dong.includes('|') ? dong.split('|') : dong.split(',');
            if (phanTich.length >= 2) {
                danhSachGui.push({
                    MaTacGia: phanTich[0].trim(),
                    TenTacGia: phanTich[1].trim()
                });
            }
        }

        if (danhSachGui.length === 0) return alert("Định dạng không hợp lệ!");

        axios.post('http://127.0.0.1:8000/tacgia/hang-loat', danhSachGui)
            .then(res => {
                alert(res.data.thong_bao);
                setDuLieuNhapNhanh('');
                layDuLieuTacGia();
            })
            .catch(err => alert(err.response?.data?.detail || "Có lỗi xảy ra!"));
    };

    // 7. XỬ LÝ THÊM HÀNG LOẠT (TỆP EXCEL)
    const xuLyTaiFileExcel = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const workbook = XLSX.read(bstr, { type: 'binary' });
                const wsname = workbook.SheetNames[0];
                const ws = workbook.Sheets[wsname];

                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                const danhSachGui = [];

                for (let i = 1; i < data.length; i++) {
                    const row = data[i];
                    if (row && row[0] && row[1]) {
                        danhSachGui.push({
                            MaTacGia: String(row[0]).trim(),
                            TenTacGia: String(row[1]).trim()
                        });
                    }
                }

                if (danhSachGui.length === 0) return alert("Tệp Excel không có dữ liệu hợp lệ!");

                axios.post('http://127.0.0.1:8000/tacgia/hang-loat', danhSachGui)
                    .then(res => {
                        alert(res.data.thong_bao);
                        layDuLieuTacGia();
                    })
                    .catch(err => alert(err.response?.data?.detail || "Lỗi khi nhập tệp Excel!"));

            } catch (error) {
                alert("Lỗi đọc tệp Excel! Vui lòng kiểm tra lại định dạng.");
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    // 8. BỘ LỌC TÌM KIẾM
    const danhSachDaLoc = danhSachTacGia.filter(tg =>
        tg.TenTacGia.toLowerCase().includes(tuKhoa.toLowerCase()) ||
        tg.MaTacGia.toLowerCase().includes(tuKhoa.toLowerCase())
    );
    const danhSachHienThi = danhSachDaLoc.slice(0, 6);

    // ================= GIAO DIỆN CHÍNH =================
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-in' }}>
            {/* PHẦN TRÊN: FORM THÊM/SỬA & BẢNG */}
            <div style={{ display: 'flex', gap: '20px' }}>
                {/* CỘT TRÁI: FORM */}
                <div style={{ flex: '1', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', alignSelf: 'flex-start' }}>
                    <h3 style={{ color: cheDoSua ? '#ffc107' : '#17a2b8', borderBottom: `2px solid ${cheDoSua ? '#ffc107' : '#17a2b8'}`, paddingBottom: '10px' }}>
                        {cheDoSua ? '✏️ Cập Nhật Tác Giả' : '✍️ Thêm Tác Giả'}
                    </h3>
                    <form onSubmit={xuLyLuuForm}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Mã Tác Giả:</label>
                            <input
                                type="text"
                                value={maTacGia}
                                onChange={e => setMaTacGia(e.target.value)}
                                disabled={cheDoSua}
                                placeholder="Ví dụ: TG01"
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: cheDoSua ? '#e9ecef' : 'white' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Tên Tác Giả:</label>
                            <input type="text" value={tenTacGia} onChange={e => setTenTacGia(e.target.value)} placeholder="Ví dụ: Nguyễn Nhật Ánh" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" style={{ flex: '1', padding: '10px', backgroundColor: cheDoSua ? '#ffc107' : '#17a2b8', color: cheDoSua ? 'black' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                {cheDoSua ? 'Lưu Thay Đổi' : 'Lưu Tác Giả'}
                            </button>
                            {cheDoSua && (
                                <button type="button" onClick={xuLyHuySua} style={{ flex: '1', padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Hủy Bỏ
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* CỘT PHẢI: BẢNG */}
                <div style={{ flex: '2', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h3 style={{ color: '#333', margin: 0 }}>Danh sách Tác giả</h3>
                        <input type="text" value={tuKhoa} onChange={e => setTuKhoa(e.target.value)} placeholder="🔍 Tìm kiếm..." style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', width: '220px', fontSize: '14px' }} />
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Mã Tác Giả</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Tên Tác Giả</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {danhSachHienThi.map((tg, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #e9ecef', backgroundColor: (cheDoSua && maTacGia === tg.MaTacGia) ? '#fff3cd' : 'transparent' }}>
                                    <td style={{ padding: '12px', textAlign: 'center' }}><strong>{tg.MaTacGia}</strong></td>
                                    <td style={{ padding: '12px' }}>{tg.TenTacGia}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button onClick={() => xuLyBamSua(tg)} style={{ padding: '6px 12px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '5px' }}>
                                            ✏️ Sửa
                                        </button>
                                        <button onClick={() => xuLyXoa(tg.MaTacGia)} style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                            🗑️ Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PHẦN DƯỚI: THÊM HÀNG LOẠT (VĂN BẢN & EXCEL) */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#28a745', borderBottom: '2px solid #28a745', paddingBottom: '10px', marginTop: 0 }}>📦 Thêm Tác Giả Hàng Loạt</h3>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: '1' }}>
                        <p style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Cách 1: Nhập văn bản (<code>Mã | Tên</code>)</p>
                        <textarea
                            rows="3"
                            value={duLieuNhapNhanh}
                            onChange={e => setDuLieuNhapNhanh(e.target.value)}
                            placeholder="TG02 | Nguyễn Nhật Ánh&#10;TG03 | Nam Cao"
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'monospace', fontSize: '13px' }}
                        />
                        <button
                            onClick={xuLyThemHangLoat}
                            style={{ marginTop: '8px', padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                        >
                            🚀 Thêm Từ Văn Bản
                        </button>
                    </div>

                    
                    <div style={{ flex: '1', borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
                        <p style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Cách 2: Tải lên tệp Excel (.xlsx, .xls)</p>
                        <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                            <i>Lưu ý: Tệp Excel cần có 2 cột (Cột A: Mã tác giả, Cột B: Tên tác giả, dòng đầu tiên là tiêu đề).</i>
                        </p>
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={xuLyTaiFileExcel}
                            style={{ padding: '8px', border: '1px dashed #28a745', borderRadius: '4px', width: '100%', boxSizing: 'border-box', cursor: 'pointer', backgroundColor: '#f8fff9' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuanLyTacGia;