import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = () => { logout(); navigate('/'); };
  return <header className="topbar">
    <div className="nav-shell">
      <Link to="/" className="brand"><span className="brand-mark">D</span><span>DriveWise<small>TRUNG TÂM ĐÀO TẠO LÁI XE</small></span></Link>
      <nav className="nav-links">
        <NavLink to="/courses">Khóa học</NavLink>
        <a href="/#process">Lộ trình học</a>
        <a href="/#about">Về chúng tôi</a>
      </nav>
      <div className="nav-actions">
        {user ? <>
          <Link className="nav-user" to="/dashboard"><span className="avatar">{user.fullName?.charAt(0) || 'U'}</span><span>{user.fullName?.split(' ').slice(-1)[0]}</span></Link>
          <button className="btn btn-quiet btn-small" onClick={signOut}>Đăng xuất</button>
        </> : <><Link className="login-link" to="/login">Đăng nhập</Link><Link className="btn btn-primary btn-small" to="/register">Đăng ký tư vấn <span>↗</span></Link></>}
      </div>
    </div>
  </header>;
}
