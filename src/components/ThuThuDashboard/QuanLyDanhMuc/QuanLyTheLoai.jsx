import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function QuanLyTheLoai() {
    const [danhSachTheLoai, setDanhSachTheLoai] = useState([]);
    const [maTheLoai, setMaTheLoai] = useState('');
    const [tenTheLoai, setTenTheLoai] = useState('');
    const [moTa, setMoTa] = useState('');
    const [tuKhoa, setTuKhoa] = useState('');
    const [duLieuNhapNhanh, setDuLieuNhapNhanh] = useState('');

    const layDuLieuTheLoai = () => {
        axios.get('http://127.0.0.1:8000/theloai')
            .then(res => setDanhSachTheLoai(res.data))
            .catch(() => alert("Lỗi tải dữ liệu thể loại!"));
    };

    useEffect(() => {
        layDuLieuTheLoai();
    }, []);

    const xuLyThem = (e) => {
        e.preventDefault();
        if (!maTheLoai || !tenTheLoai) {
            alert("Vui lòng nhập đầy đủ Mã và Tên thể loại!");
            return;
        }

        axios.post('http://127.0.0.1:8000/theloai', {
            MaTheLoai: maTheLoai,
            TenTheLoai: tenTheLoai,
            MoTa: moTa
        })
        .then(() => {
            alert("Thêm thể loại thành công!");
            setMaTheLoai(''); 
            setTenTheLoai('');
            setMoTa('');
            layDuLieuTheLoai(); 
        })
        .catch(err => {
            alert(err.response?.data?.detail || "Lỗi khi thêm thể loại!");
        });
    };

    const xuLyXoa = (ma_tl) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa thể loại mã ${ma_tl} không?`)) {
            axios.delete(`http://127.0.0.1:8000/theloai/${ma_tl}`)
            .then(() => {
                alert("Đã xóa thể loại!");
                layDuLieuTheLoai();
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
                    MaTheLoai: phanTich[0].trim(),
                    TenTheLoai: phanTich[1].trim(),
                    MoTa: phanTich[2] ? phanTich[2].trim() : ''
                });
            }
        }

        if (danhSachGui.length === 0) {
            alert("Định dạng không hợp lệ!");
            return;
        }

        axios.post('http://127.0.0.1:8000/theloai/hang-loat', danhSachGui)
            .then(res => {
                alert(res.data.thong_bao);
                setDuLieuNhapNhanh('');
                layDuLieuTheLoai();
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
                            MaTheLoai: String(row[0]).trim(),
                            TenTheLoai: String(row[1]).trim(),
                            MoTa: row[2] ? String(row[2]).trim() : ''
                        });
                    }
                }

                if (danhSachGui.length === 0) {
                    alert("Tệp Excel không có dữ liệu hợp lệ!");
                    return;
                }

                axios.post('http://127.0.0.1:8000/theloai/hang-loat', danhSachGui)
                    .then(res => {
                        alert(res.data.thong_bao);
                        layDuLieuTheLoai();
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

    const danhSachDaLoc = danhSachTheLoai.filter(tl => 
        tl.TenTheLoai.toLowerCase().includes(tuKhoa.toLowerCase()) ||
        tl.MaTheLoai.toLowerCase().includes(tuKhoa.toLowerCase())
    );

    const danhSachHienThi = danhSachDaLoc.slice(0, 6);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-in' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: '1', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', alignSelf: 'flex-start' }}>
                    <h3 style={{ color: '#17a2b8', borderBottom: '2px solid #17a2b8', paddingBottom: '10px' }}>📚 Thêm Thể Loại</h3>
                    <form onSubmit={xuLyThem}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Mã Thể Loại:</label>
                            <input type="text" value={maTheLoai} onChange={e => setMaTheLoai(e.target.value)} placeholder="Ví dụ: TL01" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Tên Thể Loại:</label>
                            <input type="text" value={tenTheLoai} onChange={e => setTenTheLoai(e.target.value)} placeholder="Ví dụ: Công nghệ phần mềm" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Mô tả:</label>
                            <input type="text" value={moTa} onChange={e => setMoTa(e.target.value)} placeholder="Mô tả ngắn gọn" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Lưu Thể Loại
                        </button>
                    </form>
                </div>

                <div style={{ flex: '2', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h3 style={{ color: '#333', margin: 0 }}>Danh sách Thể loại</h3>
                        <input 
                            type="text" 
                            value={tuKhoa} 
                            onChange={e => setTuKhoa(e.target.value)} 
                            placeholder="🔍 Tìm kiếm thể loại..." 
                            style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', width: '220px', fontSize: '14px' }} 
                        />
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Mã TL</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Tên Thể Loại</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Mô tả</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {danhSachHienThi.map((tl, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #e9ecef' }}>
                                    <td style={{ padding: '12px', textAlign: 'center' }}><strong>{tl.MaTheLoai}</strong></td>
                                    <td style={{ padding: '12px' }}>{tl.TenTheLoai}</td>
                                    <td style={{ padding: '12px', color: '#666' }}>{tl.MoTa || '---'}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => xuLyXoa(tl.MaTheLoai)}
                                            style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                        >
                                            🗑️ Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {danhSachHienThi.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>Không tìm thấy thể loại phù hợp.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#28a745', borderBottom: '2px solid #28a745', paddingBottom: '10px', marginTop: 0 }}>📦 Thêm Thể Loại Hàng Loạt</h3>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: '1' }}>
                        <p style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Cách 1: Nhập văn bản (<code>Mã | Tên | Mô tả</code>)</p>
                        <textarea 
                            rows="3" 
                            value={duLieuNhapNhanh} 
                            onChange={e => setDuLieuNhapNhanh(e.target.value)}
                            placeholder="TL01 | Lập trình | Sách chuyên ngành CNTT&#10;TL02 | Toán học | Sách đại cương"
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
                            <i>Lưu ý: Tệp Excel cần có 3 cột (Cột A: Mã, Cột B: Tên, Cột C: Mô tả).</i>
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

export default QuanLyTheLoai;