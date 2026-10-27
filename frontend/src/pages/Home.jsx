import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import CourseCard from '../components/CourseCard';

export default function Home() {
  const [courses, setCourses] = useState([]);
  useEffect(() => { api.get('/courses').then(({ data }) => setCourses(data.items.slice(0, 3))).catch(() => setCourses([])); }, []);
  return <main>
    <section className="hero-section">
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> CHỦ ĐỘNG HỌC LÁI · TỰ TIN LÀM CHỦ</div>
          <h1>Vững tay lái.<br /><em>Vững hành trình.</em></h1>
          <p className="hero-lead">Học lái xe bài bản với lộ trình rõ ràng, giảng viên đồng hành và tiến độ học tập được quản lý ngay trên một nền tảng.</p>
          <div className="hero-actions"><Link to="/courses" className="btn btn-primary btn-large">Khám phá khóa học <span>↗</span></Link><a href="#process" className="watch-link"><span className="play-icon">▷</span> Xem lộ trình học</a></div>
          <div className="hero-proof"><div className="avatar-stack"><span>H</span><span>M</span><span>A</span><span>+</span></div><div><strong>Học theo tiến độ của bạn</strong><small>Minh bạch từ đăng ký đến kết thúc khóa</small></div></div>
        </div>
        <div className="hero-visual" aria-label="Minh họa học lái xe">
          <div className="visual-topline"><span>DRIVEWISE / 01</span><span className="live-chip"><i /> LEARNING JOURNEY</span></div>
          <div className="road-scene"><div className="sun-orb" /><div className="hill hill-back" /><div className="hill hill-front" /><div className="road"><span className="road-dash" /></div><div className="car-illustration"><div className="car-window" /><div className="car-light" /><div className="wheel wheel-left" /><div className="wheel wheel-right" /></div><div className="road-sign"><span>DRIVE<br />SAFE</span></div></div>
          <div className="floating-card float-course"><span className="float-icon">✓</span><div><strong>Lộ trình rõ ràng</strong><small>Theo dõi từng cột mốc</small></div></div>
          <div className="floating-card float-progress"><div className="progress-ring"><span>01</span></div><div><strong>Học đúng nhịp</strong><small>Lý thuyết + thực hành</small></div></div>
          <div className="visual-bottomline"><span>LEARN WITH CONFIDENCE</span><span>10° 46' N / 106° 41' E</span></div>
        </div>
      </div>
      <div className="hero-bottom"><span>ĐƯỢC THIẾT KẾ CHO NGƯỜI HỌC LÁI HIỆN ĐẠI</span><div className="trust-items"><span>01 / Lộ trình bài bản</span><span>02 / Lịch học rõ ràng</span><span>03 / Tiến độ minh bạch</span></div></div>
    </section>

    <section className="section-wrap stats-strip"><div><strong>01</strong><span>Chọn khóa học<br />phù hợp</span></div><div><strong>02</strong><span>Đăng ký và<br />xác nhận hồ sơ</span></div><div><strong>03</strong><span>Học lý thuyết &<br />thực hành</span></div><div><strong>04</strong><span>Theo dõi tiến độ<br />và kết quả</span></div></section>

    <section className="section-wrap courses-section" id="courses">
      <div className="section-heading"><div><div className="eyebrow">CHƯƠNG TRÌNH ĐÀO TẠO</div><h2>Chọn lộ trình,<br /><em>bắt đầu hành trình.</em></h2></div><div className="section-heading-side"><p>Mỗi khóa học có thông tin học phí, thời lượng và nội dung rõ ràng để bạn chủ động lên kế hoạch.</p><Link to="/courses" className="text-link">Xem tất cả khóa học <span>↗</span></Link></div></div>
      {courses.length ? <div className="course-grid">{courses.map((course) => <CourseCard key={course._id} course={course} />)}</div> : <div className="empty-courses"><div className="empty-icon">↗</div><h3>Khám phá các chương trình đào tạo</h3><p>Chạy Backend và nhập dữ liệu mẫu để hiển thị khóa học trên trang này.</p><Link to="/courses" className="text-link">Mở danh mục khóa học ↗</Link></div>}
    </section>

    <section className="process-section" id="process"><div className="section-wrap process-inner"><div className="process-copy"><div className="eyebrow eyebrow-light">CÁCH DRIVEWISE VẬN HÀNH</div><h2>Mọi bước học tập<br />đều <em>có định hướng.</em></h2><p>Từ khi đăng ký đến khi hoàn thành khóa học, học viên và trung tâm làm việc trên cùng một luồng thông tin.</p><Link className="btn btn-light btn-large" to="/register">Bắt đầu ngay <span>↗</span></Link></div><div className="process-list"><div className="process-step"><span className="step-no">01</span><div><h3>Chọn khóa học</h3><p>So sánh hạng đào tạo, thời lượng và học phí.</p></div><span className="step-symbol">⌕</span></div><div className="process-step"><span className="step-no">02</span><div><h3>Gửi đăng ký</h3><p>Hồ sơ được lưu để trung tâm xác nhận.</p></div><span className="step-symbol">↗</span></div><div className="process-step"><span className="step-no">03</span><div><h3>Theo dõi tiến độ</h3><p>Quản lý lịch học, bài học và kết quả trong tài khoản.</p></div><span className="step-symbol">✓</span></div></div></div></section>

    <section className="section-wrap about-section" id="about"><div className="about-mark">D<span>W</span></div><div><div className="eyebrow">HỌC TẬP CÓ HỆ THỐNG</div><h2>Không chỉ là một khóa học.<br /><em>Là hành trình tự tin.</em></h2></div><p>DriveWise là prototype minh họa nền tảng quản lý đào tạo lái xe: học viên đăng ký khóa học, giảng viên quản lý bài học và lịch, quản trị viên theo dõi hoạt động.</p></section>
  </main>;
}
