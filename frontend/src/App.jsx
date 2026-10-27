import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function Footer() {
  return <footer className="site-footer"><div className="footer-brand"><span className="brand-mark">D</span><div><strong>DriveWise</strong><small>HỌC LÁI XE THÔNG MINH</small></div></div><p>Học có định hướng. Lái xe có trách nhiệm.</p><span>© 2026 DriveWise · Prototype học thuật</span></footer>;
}
export default function App() {
  return <><Navbar /><Routes><Route path="/" element={<Home />} /><Route path="/courses" element={<Courses />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/dashboard" element={<Dashboard />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes><Footer /></>;
}
