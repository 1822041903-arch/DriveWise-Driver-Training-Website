import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api';
import CourseCard from '../components/CourseCard';

const categories = ['Tất cả', 'A1', 'A', 'B', 'C1', 'C', 'D1'];
export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [category, setCategory] = useState('Tất cả');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = {};
      if (category !== 'Tất cả') params.category = category;
      if (query.trim()) params.q = query.trim();
      api.get('/courses', { params }).then(({ data }) => { setCourses(data.items); setError(''); }).catch((err) => setError(getErrorMessage(err)));
    }, 180);
    return () => clearTimeout(timer);
  }, [category, query]);
  return <main className="page-main">
    <section className="page-hero"><div className="eyebrow">DANH MỤC ĐÀO TẠO</div><h1>Tìm khóa học<br /><em>phù hợp với bạn.</em></h1><p>Thông tin rõ ràng. Lộ trình có định hướng. Bắt đầu từ lựa chọn phù hợp nhất.</p><div className="search-wrap"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên hoặc mã khóa học..." aria-label="Tìm khóa học" /></div></section>
    <section className="section-wrap catalog-section"><div className="catalog-toolbar"><div className="filter-chips">{categories.map((value) => <button className={`filter-chip ${category === value ? 'active' : ''}`} onClick={() => setCategory(value)} key={value}>{value === 'Tất cả' ? value : `Hạng ${value}`}</button>)}</div><span className="results-count">{courses.length} khóa học</span></div>
      {error && <div className="notice notice-error">{error}</div>}
      {courses.length ? <div className="course-grid">{courses.map((course) => <CourseCard key={course._id} course={course} />)}</div> : <div className="empty-courses"><div className="empty-icon">⌕</div><h3>Chưa tìm thấy khóa học phù hợp</h3><p>Hãy đổi từ khóa, bộ lọc hoặc kiểm tra Backend/MongoDB.</p></div>}
    </section>
  </main>;
}
