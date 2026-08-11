import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function QuanLyKeSach() {
    const [danhSachKeSach, setDanhSachKeSach] = useState([]);
    const [maKeSach, setMaKeSach] = useState('');
    const [tenKeSach, setTenKeSach] = useState('');
    const [viTri, setViTri] = useState('');
    const [tuKhoa, setTuKhoa] = useState('');
    const [duLieuNhapNhanh, setDuLieuNhapNhanh] = useState('');

    const layDuLieuKeSach = () => {
        axios.get('http://127.0.0.1:8000/kesach')
            .then(res => setDanhSachKeSach(res.data))
            .catch(() => alert("Lỗi tải dữ liệu Kệ sách!"));
    };

    useEffect(() => {
        layDuLieuKeSach();
    }, []);

    const xuLyThem = (e) => {
        e.preventDefault();
        if (!maKeSach || !tenKeSach) {
            alert("Vui lòng nhập đầy đủ Mã và Tên Kệ sách!");
            return;
        }

        axios.post('http://127.0.0.1:8000/kesach', {
            MaKeSach: maKeSach,
            TenKeSach: tenKeSach,
            ViTri: viTri
        })
            .then(() => {
                alert("Thêm Kệ sách thành công!");
                setMaKeSach('');
                setTenKeSach('');
                setViTri('');
                layDuLieuKeSach();
            })
            .catch(err => {
                alert(err.response?.data?.detail || "Lỗi khi thêm Kệ sách!");
            });
    };

    const xuLyXoa = (ma_ks) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa kệ sách mã ${ma_ks} không?`)) {
            axios.delete(`http://127.0.0.1:8000/kesach/${ma_ks}`)
                .then(() => {
                    alert("Đã xóa Kệ sách!");
                    layDuLieuKeSach();
                })
                .catch(err => alert(err.response?.data?.detail || "Đã có lỗi xảy ra!"));
        }
    };

    const xuLyThemHangLoat = () => {
        if (!duLieuNhapNhanh.trim()) {
            alert("Vui lòng nhập dữ liệu để thêm hàng loạt!");
            return;
        }

        const dongList = duLieuNhapNhanh.split('\n');
        const danhSachGui = [];

        for (let dong of dongList) {
            if (!dong.trim()) continue;
            const phanTich = dong.includes('|') ? dong.split('|') : dong.split(',');
            if (phanTich.length >= 2) {
                danhSachGui.push({
                    MaKeSach: phanTich[0].trim(),
                    TenKeSach: phanTich[1].trim(),
                    ViTri: phanTich[2] ? phanTich[2].trim() : ''
                });
            }
        }

        if (danhSachGui.length === 0) {
            alert("Định dạng không hợp lệ!");
            return;
        }

        axios.post('http://127.0.0.1:8000/kesach/hang-loat', danhSachGui)
            .then(res => {
                alert(res.data.thong_bao);
                setDuLieuNhapNhanh('');
                layDuLieuKeSach();
            })
            .catch(err => {
                alert(err.response?.data?.detail || "Có lỗi xảy ra!");
            });
    };

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
                            MaKeSach: String(row[0]).trim(),
                            TenKeSach: String(row[1]).trim(),
                            ViTri: row[2] ? String(row[2]).trim() : ''
                        });
                    }
                }

                if (danhSachGui.length === 0) {
                    alert("Tệp Excel không có dữ liệu hợp lệ!");
                    return;
                }

                axios.post('http://127.0.0.1:8000/kesach/hang-loat', danhSachGui)
                    .then(res => {
                        alert(res.data.thong_bao);
                        layDuLieuKeSach();
                    })
                    .catch(err => {
                        alert(err.response?.data?.detail || "Lỗi khi nhập tệp Excel!");
                    });
            } catch (error) {
                alert("Lỗi đọc tệp Excel!");
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    const danhSachDaLoc = danhSachKeSach.filter(ks =>
        ks.TenKeSach.toLowerCase().includes(tuKhoa.toLowerCase()) ||
        ks.MaKeSach.toLowerCase().includes(tuKhoa.toLowerCase())
    );

    const danhSachHienThi = danhSachDaLoc.slice(0, 6);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-in' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: '1', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', alignSelf: 'flex-start' }}>
                    <h3 style={{ color: '#17a2b8', borderBottom: '2px solid #17a2b8', paddingBottom: '10px' }}>🗄️ Thêm Kệ Sách</h3>
                    <form onSubmit={xuLyThem}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Mã Kệ Sách:</label>
                            <input type="text" value={maKeSach} onChange={e => setMaKeSach(e.target.value)} placeholder="Ví dụ: KS01" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Tên Kệ Sách:</label>
                            <input type="text" value={tenKeSach} onChange={e => setTenKeSach(e.target.value)} placeholder="Ví dụ: Kệ Sách IT" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Vị trí:</label>
                            <input type="text" value={viTri} onChange={e => setViTri(e.target.value)} placeholder="Ví dụ: Tầng 1 - Khu A" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Lưu Kệ Sách
                        </button>
                    </form>
                </div>

                <div style={{ flex: '2', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h3 style={{ color: '#333', margin: 0 }}>Danh sách Kệ sách</h3>
                        <input
                            type="text"
                            value={tuKhoa}
                            onChange={e => setTuKhoa(e.target.value)}
                            placeholder="🔍 Tìm kiếm kệ sách..."
                            style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', width: '220px', fontSize: '14px' }}
                        />
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Mã Kệ</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Tên Kệ Sách</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Vị trí</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {danhSachHienThi.map((ks, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #e9ecef' }}>
                                    <td style={{ padding: '12px', textAlign: 'center' }}><strong>{ks.MaKeSach}</strong></td>
                                    <td style={{ padding: '12px' }}>{ks.TenKeSach}</td>
                                    <td style={{ padding: '12px', color: '#666' }}>{ks.ViTri || '---'}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => xuLyXoa(ks.MaKeSach)}
                                            style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                        >
                                            🗑️ Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {danhSachHienThi.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>Không tìm thấy Kệ sách phù hợp.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#28a745', borderBottom: '2px solid #28a745', paddingBottom: '10px', marginTop: 0 }}>📦 Thêm Kệ Sách Hàng Loạt</h3>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: '1' }}>
                        <p style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Cách 1: Nhập văn bản (<code>Mã | Tên | Vị trí</code>)</p>
                        <textarea
                            rows="3"
                            value={duLieuNhapNhanh}
                            onChange={e => setDuLieuNhapNhanh(e.target.value)}
                            placeholder="KS01 | Kệ CNTT | Tầng 1 - Khu A&#10;KS02 | Kệ Kinh Tế | Tầng 2 - Khu B"
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
                            <i>Lưu ý: Tệp Excel cần có 3 cột (Cột A: Mã kệ, Cột B: Tên kệ, Cột C: Vị trí).</i>
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

export default QuanLyKeSach;