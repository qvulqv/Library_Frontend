import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function QuanLyNXB() {
    const [danhSachNXB, setDanhSachNXB] = useState([]);

    // Các trường thông tin
    const [maNXB, setMaNXB] = useState('');
    const [tenNXB, setTenNXB] = useState('');
    const [diaChi, setDiaChi] = useState('');
    const [email, setEmail] = useState('');

    const [tuKhoa, setTuKhoa] = useState('');
    const [duLieuNhapNhanh, setDuLieuNhapNhanh] = useState('');

    const layDuLieuNXB = () => {
        axios.get('http://127.0.0.1:8000/nxb')
            .then(res => setDanhSachNXB(res.data))
            .catch(() => alert("Lỗi tải dữ liệu Nhà xuất bản!"));
    };

    useEffect(() => {
        layDuLieuNXB();
    }, []);

    const xuLyThem = (e) => {
        e.preventDefault();
        if (!maNXB || !tenNXB) {
            alert("Vui lòng nhập đầy đủ Mã và Tên Nhà xuất bản!");
            return;
        }

        // Chuyển mã thành số nguyên vì CSDL yêu cầu kiểu INT
        const maNXBInt = parseInt(maNXB, 10);
        if (isNaN(maNXBInt)) {
            alert("Mã Nhà xuất bản bắt buộc phải là số!");
            return;
        }

        axios.post('http://127.0.0.1:8000/nxb', {
            MaNXB: maNXBInt,
            TenNXB: tenNXB,
            DiaChi: diaChi,
            Email: email
        })
            .then(() => {
                alert("Thêm Nhà xuất bản thành công!");
                setMaNXB('');
                setTenNXB('');
                setDiaChi('');
                setEmail('');
                layDuLieuNXB();
            })
            .catch(err => {
                alert(err.response?.data?.detail || "Lỗi khi thêm Nhà xuất bản!");
            });
    };

    const xuLyXoa = (ma_nxb) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa NXB mã ${ma_nxb} không?`)) {
            axios.delete(`http://127.0.0.1:8000/nxb/${ma_nxb}`)
                .then(() => {
                    alert("Đã xóa Nhà xuất bản!");
                    layDuLieuNXB();
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
                const parsedMaNXB = parseInt(phanTich[0].trim(), 10);
                if (!isNaN(parsedMaNXB)) {
                    danhSachGui.push({
                        MaNXB: parsedMaNXB,
                        TenNXB: phanTich[1].trim(),
                        DiaChi: phanTich[2] ? phanTich[2].trim() : '',
                        Email: phanTich[3] ? phanTich[3].trim() : ''
                    });
                }
            }
        }

        if (danhSachGui.length === 0) {
            alert("Định dạng không hợp lệ hoặc Mã NXB không phải là số!");
            return;
        }

        axios.post('http://127.0.0.1:8000/nxb/hang-loat', danhSachGui)
            .then(res => {
                alert(res.data.thong_bao);
                setDuLieuNhapNhanh('');
                layDuLieuNXB();
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
                        const parsedMaNXB = parseInt(String(row[0]).trim(), 10);
                        if (!isNaN(parsedMaNXB)) {
                            danhSachGui.push({
                                MaNXB: parsedMaNXB,
                                TenNXB: String(row[1]).trim(),
                                DiaChi: row[2] ? String(row[2]).trim() : '',
                                Email: row[3] ? String(row[3]).trim() : ''
                            });
                        }
                    }
                }

                if (danhSachGui.length === 0) {
                    alert("Tệp Excel không có dữ liệu hợp lệ (Mã NXB phải là số)!");
                    return;
                }

                axios.post('http://127.0.0.1:8000/nxb/hang-loat', danhSachGui)
                    .then(res => {
                        alert(res.data.thong_bao);
                        layDuLieuNXB();
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

    const danhSachDaLoc = danhSachNXB.filter(nxb =>
        nxb.TenNXB.toLowerCase().includes(tuKhoa.toLowerCase()) ||
        String(nxb.MaNXB).includes(tuKhoa)
    );

    const danhSachHienThi = danhSachDaLoc.slice(0, 6);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-in' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
                {/* Form Thêm Mới */}
                <div style={{ flex: '1', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', alignSelf: 'flex-start' }}>
                    <h3 style={{ color: '#17a2b8', borderBottom: '2px solid #17a2b8', paddingBottom: '10px' }}>🏢 Thêm Nhà Xuất Bản</h3>
                    <form onSubmit={xuLyThem}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Mã NXB (Số):</label>
                            <input type="number" value={maNXB} onChange={e => setMaNXB(e.target.value)} placeholder="Ví dụ: 1" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Tên NXB:</label>
                            <input type="text" value={tenNXB} onChange={e => setTenNXB(e.target.value)} placeholder="Ví dụ: NXB Trẻ" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Địa chỉ:</label>
                            <input type="text" value={diaChi} onChange={e => setDiaChi(e.target.value)} placeholder="Địa chỉ NXB" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email:</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Ví dụ: contact@nxbtre.com.vn" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Lưu Nhà Xuất Bản
                        </button>
                    </form>
                </div>

                {/* Bảng Danh Sách */}
                <div style={{ flex: '2', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h3 style={{ color: '#333', margin: 0 }}>Danh sách NXB</h3>
                        <input
                            type="text"
                            value={tuKhoa}
                            onChange={e => setTuKhoa(e.target.value)}
                            placeholder="🔍 Tìm kiếm NXB..."
                            style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', width: '220px', fontSize: '14px' }}
                        />
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Mã (Số)</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Tên NXB</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Liên hệ</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {danhSachHienThi.map((nxb, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #e9ecef' }}>
                                    <td style={{ padding: '12px', textAlign: 'center' }}><strong>{nxb.MaNXB}</strong></td>
                                    <td style={{ padding: '12px' }}>{nxb.TenNXB}</td>
                                    <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                                        <div>{nxb.DiaChi || '---'}</div>
                                        <div>{nxb.Email || '---'}</div>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => xuLyXoa(nxb.MaNXB)}
                                            style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                        >
                                            🗑️ Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {danhSachHienThi.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>Không tìm thấy Nhà xuất bản phù hợp.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Khối Thêm Hàng Loạt */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#28a745', borderBottom: '2px solid #28a745', paddingBottom: '10px', marginTop: 0 }}>📦 Thêm NXB Hàng Loạt</h3>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: '1' }}>
                        <p style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Cách 1: Nhập văn bản (<code>Mã Số | Tên | Địa chỉ | Email</code>)</p>
                        <textarea
                            rows="3"
                            value={duLieuNhapNhanh}
                            onChange={e => setDuLieuNhapNhanh(e.target.value)}
                            placeholder="1 | NXB Trẻ | 161B Lý Chính Thắng | info@nxbtre.com.vn&#10;2 | NXB Kim Đồng | 55 Quang Trung | cskh@nxbkimdong.com.vn"
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
                            <i>Lưu ý: Tệp Excel cần 4 cột (Mã số, Tên, Địa chỉ, Email). Cột Mã phải là Số.</i>
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

export default QuanLyNXB;