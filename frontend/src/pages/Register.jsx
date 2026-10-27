import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try { await register(form); navigate('/dashboard'); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };
  return <main className="auth-layout"><div className="auth-art"><div className="eyebrow eyebrow-light">BƯỚC ĐẦU CỦA HÀNH TRÌNH</div><h1>Chủ động học.<br /><em>Tự tin cầm lái.</em></h1><p>Tạo tài khoản để đăng ký khóa học và cập nhật thông tin đào tạo của bạn.</p><div className="auth-road">DW <span>YOUR ROAD. YOUR PACE.</span></div></div><div className="auth-panel"><div className="auth-card"><div className="eyebrow">TẠO TÀI KHOẢN HỌC VIÊN</div><h2>Đăng ký</h2><p className="muted">Các trường có dấu * là bắt buộc.</p><form onSubmit={submit} className="form-stack"><label>Họ và tên *<input name="fullName" autoComplete="name" value={form.fullName} onChange={change} placeholder="Nguyễn Văn A" required minLength={2} /></label><label>Email *<input type="email" name="email" autoComplete="email" value={form.email} onChange={change} placeholder="ban@email.com" required /></label><label>Số điện thoại<input type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={change} placeholder="09xx xxx xxx" /></label><label>Mật khẩu *<input type="password" name="password" autoComplete="new-password" value={form.password} onChange={change} placeholder="Tối thiểu 8 ký tự" required minLength={8} /></label>{error && <div className="notice notice-error">{error}</div>}<button className="btn btn-primary btn-large full-btn" disabled={busy}>{busy ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'} <span>↗</span></button></form><div className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></div></div></div></main>;
}
