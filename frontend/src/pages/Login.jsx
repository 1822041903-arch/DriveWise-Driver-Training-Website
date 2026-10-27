import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try { await login(form); navigate('/dashboard'); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };
  return <main className="auth-layout"><div className="auth-art"><div className="eyebrow eyebrow-light">CHÀO MỪNG TRỞ LẠI</div><h1>Hành trình của bạn<br /><em>tiếp tục từ đây.</em></h1><p>Đăng nhập để theo dõi khóa học, lịch học và tiến độ đào tạo.</p><div className="auth-road">DW <span>DRIVEWISE / LEARN WITH CONFIDENCE</span></div></div><div className="auth-panel"><div className="auth-card"><div className="eyebrow">TÀI KHOẢN DRIVEWISE</div><h2>Đăng nhập</h2><p className="muted">Nhập thông tin tài khoản của bạn.</p><form onSubmit={submit} className="form-stack"><label>Email<input type="email" name="email" autoComplete="email" value={form.email} onChange={change} placeholder="ban@email.com" required /></label><label>Mật khẩu<input type="password" name="password" autoComplete="current-password" value={form.password} onChange={change} placeholder="Ít nhất 8 ký tự" required /></label>{error && <div className="notice notice-error">{error}</div>}<button className="btn btn-primary btn-large full-btn" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'} <span>↗</span></button></form><div className="auth-switch">Chưa có tài khoản? <Link to="/register">Tạo tài khoản</Link></div><div className="demo-credentials"><strong>Tài khoản demo (sau khi chạy seed)</strong><span>admin@laixe.local / Admin123!</span><span>hocvien@laixe.local / Student123!</span></div></div></div></main>;
}
