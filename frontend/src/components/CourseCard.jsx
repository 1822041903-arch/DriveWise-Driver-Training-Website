import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';

const accents = { B: 'course-olive', A1: 'course-orange', A: 'course-purple', C1: 'course-blue', C: 'course-blue', 'Khác': 'course-olive' };
const icons = { B: '🚘', A1: '🛵', A: '🏍️', C1: '🚚', C: '🚛', 'Khác': '🚦' };
const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);

export default function CourseCard({ course, compact = false }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const enroll = async () => {
    if (!user) { window.location.href = '/login'; return; }
    if (user.role !== 'student') { setNotice('Tài khoản giảng viên/quản trị không đăng ký khóa học.'); return; }
    setBusy(true); setNotice('');
    try {
      const { data } = await api.post('/enrollments', { courseId: course._id });
      setNotice(data.message || 'Đăng ký thành công.');
    } catch (error) { setNotice(getErrorMessage(error)); }
    finally { setBusy(false); }
  };
  return <article className={`course-card ${compact ? 'course-card-compact' : ''}`}>
    <div className={`course-art ${accents[course.category] || 'course-olive'}`}>
      <span className="category-pill">HẠNG {course.category}</span>
      <span className="course-emoji" aria-hidden="true">{icons[course.category] || '🚘'}</span>
      <span className="art-rings" aria-hidden="true" />
      <span className="course-code">{course.code}</span>
    </div>
    <div className="course-content">
      <div className="course-meta"><span>{course.type || 'Tổng hợp'}</span><span className="meta-dot" /> <span>{course.durationWeeks} tuần</span></div>
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <div className="course-footer"><div><small>Học phí tham khảo</small><strong>{money(course.tuition)}</strong></div><button className="arrow-btn" onClick={enroll} disabled={busy} aria-label={`Đăng ký ${course.title}`}>{busy ? '…' : '↗'}</button></div>
      {notice && <div className="inline-notice" role="status">{notice}</div>}
    </div>
  </article>;
}
