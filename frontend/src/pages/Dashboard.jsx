import { useCallback, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
const statusText = { pending: 'Chờ xác nhận', approved: 'Đã xác nhận', 'in-progress': 'Đang học', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
const roleText = { student: 'Học viên', instructor: 'Giảng viên', admin: 'Quản trị viên' };

function CourseManager({ refresh, users = [], courses = [], isAdmin = false }) {
  const initialForm = { title: '', code: '', category: 'B', type: 'Tổng hợp', description: '', durationWeeks: 12, tuition: 10000000, seatLimit: 30, status: 'published', instructor: '' };
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [cloneForm, setCloneForm] = useState({ sourceId: '', title: '', code: '' });
  const [cloning, setCloning] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });
  const changeClone = (e) => setCloneForm({ ...cloneForm, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setMessage('');
    try { await api.post('/courses', form); setMessage('Đã tạo khóa học.'); setForm(initialForm); refresh(); }
    catch (error) { setMessage(getErrorMessage(error)); }
    finally { setSaving(false); }
  };
  const submitClone = async (e) => {
    e.preventDefault(); setCloning(true); setMessage('');
    try {
      const { data } = await api.post(`/courses/${cloneForm.sourceId}/clone`, { title: cloneForm.title, code: cloneForm.code });
      setMessage(`${data.message} Đã sao chép ${data.clonedLessonCount} bài học.`);
      setCloneForm({ sourceId: '', title: '', code: '' });
      refresh();
    } catch (error) { setMessage(getErrorMessage(error)); }
    finally { setCloning(false); }
  };
  return <section className="dashboard-panel"><div className="panel-title-row"><div><div className="eyebrow">QUẢN LÝ NỘI DUNG</div><h2>Tạo khóa học mới</h2></div><span className="role-badge">FE + API</span></div><form className="manager-form" onSubmit={submit}><label>Tên khóa học<input name="title" value={form.title} onChange={change} required minLength={3} /></label><label>Mã khóa học<input name="code" value={form.code} onChange={change} required placeholder="VD: B-002" /></label><label>Hạng đào tạo<select name="category" value={form.category} onChange={change}>{['A1','A','B','C1','C','D1','Khác'].map((v) => <option key={v}>{v}</option>)}</select></label><label>Hình thức<select name="type" value={form.type} onChange={change}>{['Lý thuyết','Thực hành','Tổng hợp'].map((v) => <option key={v}>{v}</option>)}</select></label><label>Thời lượng (tuần)<input type="number" min="1" name="durationWeeks" value={form.durationWeeks} onChange={change} required /></label><label>Học phí (VNĐ)<input type="number" min="0" step="100000" name="tuition" value={form.tuition} onChange={change} required /></label><label>Số chỗ tối đa<input type="number" min="1" name="seatLimit" value={form.seatLimit} onChange={change} required /></label>{isAdmin && <label>Giảng viên phụ trách<select name="instructor" value={form.instructor || ''} onChange={change} required><option value="">Chọn giảng viên...</option>{users.filter((item) => item.role === 'instructor').map((item) => <option key={item._id} value={item._id}>{item.fullName} — {item.email}</option>)}</select></label>}<label className="wide-field">Mô tả<textarea name="description" rows="3" minLength="10" value={form.description} onChange={change} required /></label>{message && <div className="notice">{message}</div>}<button className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu…' : 'Tạo khóa học'} ↗</button></form>{isAdmin && <div className="course-clone-section"><div className="panel-title-row"><div><div className="eyebrow">PROTOTYPE PATTERN</div><h3>Nhân bản khóa học mẫu</h3></div></div><p className="muted">Sao chép thông tin khóa học và danh sách bài học thành bản nháp; lịch học và hồ sơ học viên không được sao chép.</p>{courses.length ? <form className="manager-form" onSubmit={submitClone}><label className="wide-field">Khóa học nguồn<select name="sourceId" value={cloneForm.sourceId} onChange={changeClone} required><option value="">Chọn khóa học mẫu...</option>{courses.map((course) => <option value={course._id} key={course._id}>{course.code} — {course.title} ({course.status})</option>)}</select></label><label>Tên khóa học mới<input name="title" value={cloneForm.title} onChange={changeClone} required minLength={3} placeholder="VD: Khóa B - K12" /></label><label>Mã khóa học mới<input name="code" value={cloneForm.code} onChange={changeClone} required pattern="[A-Za-z0-9_-]{2,20}" placeholder="VD: B-K12" /></label><button className="btn btn-quiet" disabled={cloning}>{cloning ? 'Đang nhân bản…' : 'Tạo bản nháp từ mẫu'} ↗</button></form> : <p className="muted">Chưa có khóa học nguồn để nhân bản.</p>}</div>}</section>;
}

function UserManager({ users, refresh }) {
  const [message, setMessage] = useState('');
  const updateRole = async (userId, role) => {
    setMessage('');
    try { await api.patch(`/users/${userId}/role`, { role }); setMessage('Đã cập nhật vai trò người dùng.'); refresh(); }
    catch (error) { setMessage(getErrorMessage(error)); }
  };
  return <section className="dashboard-panel"><div className="panel-title-row"><div><div className="eyebrow">QUẢN TRỊ TÀI KHOẢN</div><h2>Người dùng</h2></div><span className="role-badge">{users.length} tài khoản</span></div>{message && <div className="notice">{message}</div>}{users.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Họ tên</th><th>Email</th><th>Điện thoại</th><th>Vai trò</th></tr></thead><tbody>{users.map((item) => <tr key={item._id}><td>{item.fullName}</td><td>{item.email}</td><td>{item.phone || '—'}</td><td><select className="role-select" value={item.role} onChange={(e) => updateRole(item._id, e.target.value)} aria-label={`Vai trò của ${item.fullName}`}>{['student','instructor','admin'].map((role) => <option key={role} value={role}>{roleText[role]}</option>)}</select></td></tr>)}</tbody></table></div> : <p className="muted">Chưa có tài khoản để hiển thị.</p>}</section>;
}

function EnrollmentManager({ enrollments, refresh }) {
  const [message, setMessage] = useState('');
  const updateStatus = async (id, status) => {
    setMessage('');
    try { await api.patch(`/enrollments/${id}/status`, { status }); setMessage('Đã cập nhật hồ sơ đăng ký.'); refresh(); }
    catch (error) { setMessage(getErrorMessage(error)); }
  };
  return <section className="dashboard-panel"><div className="panel-title-row"><div><div className="eyebrow">HỒ SƠ HỌC VIÊN</div><h2>Quản lý đăng ký</h2></div><span className="role-badge">{enrollments.length} hồ sơ</span></div>{message && <div className="notice">{message}</div>}{enrollments.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Học viên</th><th>Khóa học</th><th>Ngày đăng ký</th><th>Trạng thái</th></tr></thead><tbody>{enrollments.map((item) => <tr key={item._id}><td>{item.student?.fullName || '—'}<small className="table-subline">{item.student?.email}</small></td><td>{item.course?.title || '—'}</td><td>{new Date(item.enrolledAt).toLocaleDateString('vi-VN')}</td><td><select className="role-select" value={item.status} onChange={(e) => updateStatus(item._id, e.target.value)} aria-label={`Trạng thái hồ sơ ${item._id}`}>{Object.keys(statusText).map((status) => <option value={status} key={status}>{statusText[status]}</option>)}</select></td></tr>)}</tbody></table></div> : <p className="muted">Chưa có hồ sơ đăng ký.</p>}</section>;
}

function ScheduleManager({ courses, refresh }) {
  const [form, setForm] = useState({ courseId: '', startsAt: '', endsAt: '', location: '', sessionType: 'practice' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (!form.courseId && courses.length) setForm((current) => ({ ...current, courseId: courses[0]._id })); }, [courses, form.courseId]);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setMessage('');
    try { await api.post('/schedules', { ...form, startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt).toISOString() }); setMessage('Đã tạo lịch đào tạo.'); setForm((old) => ({ ...old, startsAt: '', endsAt: '', location: '' })); refresh(); }
    catch (error) { setMessage(getErrorMessage(error)); }
    finally { setSaving(false); }
  };
  return <section className="dashboard-panel"><div className="panel-title-row"><div><div className="eyebrow">KẾ HOẠCH ĐÀO TẠO</div><h2>Tạo lịch học / thi</h2></div></div>{courses.length ? <form className="manager-form" onSubmit={submit}><label className="wide-field">Khóa học<select name="courseId" value={form.courseId} onChange={change} required>{courses.map((course) => <option key={course._id} value={course._id}>{course.code} — {course.title}</option>)}</select></label><label>Bắt đầu<input type="datetime-local" name="startsAt" value={form.startsAt} onChange={change} required /></label><label>Kết thúc<input type="datetime-local" name="endsAt" value={form.endsAt} onChange={change} required /></label><label>Loại buổi học<select name="sessionType" value={form.sessionType} onChange={change}>{[['theory','Lý thuyết'],['practice','Thực hành'],['exam','Kiểm tra/thi']].map(([v, label]) => <option value={v} key={v}>{label}</option>)}</select></label><label>Địa điểm<input name="location" value={form.location} onChange={change} placeholder="VD: Sân tập số 1" required /></label>{message && <div className="notice">{message}</div>}<button className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu…' : 'Tạo lịch'} ↗</button></form> : <p className="muted">Hãy tạo khóa học trước khi thêm lịch đào tạo.</p>}</section>;
}

function LessonManager({ courses, refresh }) {
  const [form, setForm] = useState({ courseId: '', title: '', lessonType: 'theory', order: 1, summary: '', videoUrl: '', materialsUrl: '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (!form.courseId && courses.length) setForm((current) => ({ ...current, courseId: courses[0]._id })); }, [courses, form.courseId]);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setMessage('');
    try { await api.post('/lessons', form); setMessage('Đã thêm bài học.'); setForm((old) => ({ ...old, title: '', order: Number(old.order) + 1, summary: '', videoUrl: '', materialsUrl: '' })); refresh(); }
    catch (error) { setMessage(getErrorMessage(error)); }
    finally { setSaving(false); }
  };
  return <section className="dashboard-panel"><div className="panel-title-row"><div><div className="eyebrow">NỘI DUNG GIẢNG DẠY</div><h2>Thêm bài học</h2></div></div>{courses.length ? <form className="manager-form" onSubmit={submit}><label className="wide-field">Khóa học<select name="courseId" value={form.courseId} onChange={change} required>{courses.map((course) => <option key={course._id} value={course._id}>{course.code} — {course.title}</option>)}</select></label><label>Tên bài học<input name="title" value={form.title} onChange={change} required /></label><label>Loại bài<select name="lessonType" value={form.lessonType} onChange={change}><option value="theory">Lý thuyết</option><option value="practice">Thực hành</option></select></label><label>Thứ tự<input type="number" min="1" name="order" value={form.order} onChange={change} required /></label><label>Video URL<input name="videoUrl" value={form.videoUrl} onChange={change} placeholder="https://..." /></label><label className="wide-field">Tóm tắt<textarea name="summary" rows="2" value={form.summary} onChange={change} /></label>{message && <div className="notice">{message}</div>}<button className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu…' : 'Thêm bài học'} ↗</button></form> : <p className="muted">Hãy tạo khóa học trước khi thêm bài học.</p>}</section>;
}

function ExamResultManager({ courses, students, refresh }) {
  const [form, setForm] = useState({ studentId: '', courseId: '', examType: 'theory', score: 0, feedback: '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setForm((current) => ({ ...current, studentId: current.studentId || students[0]?._id || '', courseId: current.courseId || courses[0]?._id || '' }));
  }, [students, courses]);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setMessage('');
    try { const { data } = await api.post('/exam-results', form); setMessage(`Đã lưu kết quả. Chiến lược: ${data.evaluation.strategy}; ngưỡng demo: ${data.evaluation.passingScore}/100; ${data.evaluation.passed ? 'Đạt' : 'Chưa đạt'}.`); setForm((old) => ({ ...old, score: 0, feedback: '' })); refresh(); }
    catch (error) { setMessage(getErrorMessage(error)); }
    finally { setSaving(false); }
  };
  return <section className="dashboard-panel"><div className="panel-title-row"><div><div className="eyebrow">ĐÁNH GIÁ KẾT QUẢ</div><h2>Ghi nhận kết quả thi</h2><p className="muted">Strategy Pattern minh họa: lý thuyết 50/100, thực hành 70/100; không phải ngưỡng thi sát hạch chính thức.</p></div></div>{courses.length && students.length ? <form className="manager-form" onSubmit={submit}><label>Học viên<select name="studentId" value={form.studentId} onChange={change} required>{students.map((student) => <option key={student._id} value={student._id}>{student.fullName} — {student.email}</option>)}</select></label><label>Khóa học<select name="courseId" value={form.courseId} onChange={change} required>{courses.map((course) => <option key={course._id} value={course._id}>{course.code} — {course.title}</option>)}</select></label><label>Loại bài<select name="examType" value={form.examType} onChange={change}><option value="theory">Lý thuyết</option><option value="practice">Thực hành</option></select></label><label>Điểm (0–100)<input type="number" min="0" max="100" name="score" value={form.score} onChange={change} required /></label><label className="wide-field">Nhận xét<textarea name="feedback" rows="2" value={form.feedback} onChange={change} /></label>{message && <div className="notice">{message}</div>}<button className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu kết quả'} ↗</button></form> : <p className="muted">Cần có ít nhất một khóa học và một tài khoản học viên để ghi kết quả.</p>}</section>;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((n) => n + 1), []);

  useEffect(() => {
    if (!user) return;
    setError('');
    const jobs = [];
    if (user.role === 'student') {
      jobs.push(api.get('/enrollments/my').then(({ data }) => setEnrollments(data.items)));
      jobs.push(api.get('/schedules').then(({ data }) => setSchedules(data.items)).catch(() => setSchedules([])));
      jobs.push(api.get('/exam-results/my').then(({ data }) => setExamResults(data.items)).catch(() => setExamResults([])));
    } else {
      jobs.push(api.get('/courses', { params: user.role === 'admin' ? {} : { status: 'published' } }).then(({ data }) => setCourses(data.items)));
      jobs.push(api.get('/schedules').then(({ data }) => setSchedules(data.items)));
      jobs.push(api.get('/enrollments').then(({ data }) => setAllEnrollments(data.items)));
      jobs.push(api.get('/users', { params: user.role === 'instructor' ? { role: 'student' } : {} }).then(({ data }) => setUsers(data.items)));
    }
    Promise.all(jobs).catch((err) => setError(getErrorMessage(err)));
  }, [user, refreshKey]);

  if (loading) return <main className="page-main"><div className="loading-state">Đang tải tài khoản…</div></main>;
  if (!user) return <main className="page-main"><div className="auth-required"><h1>Bạn chưa đăng nhập</h1><p>Đăng nhập để xem khu vực học tập.</p><a className="btn btn-primary" href="/login">Đăng nhập ↗</a></div></main>;
  const roleName = roleText[user.role];

  return <main className="page-main dashboard-page">
    <section className="dashboard-welcome"><div><div className="eyebrow eyebrow-light">KHU VỰC CÁ NHÂN / {roleName?.toUpperCase()}</div><h1>Xin chào, <em>{user.fullName.split(' ').slice(-1)[0]}.</em></h1><p>Thông tin học tập và hoạt động của bạn được tổng hợp tại đây.</p></div><div className="welcome-avatar">{user.fullName.charAt(0)}</div></section>
    {error && <div className="notice notice-error">{error}</div>}
    {user.role === 'student' ? <>
      <div className="dashboard-stats"><div><span>HỒ SƠ ĐĂNG KÝ</span><strong>{enrollments.length.toString().padStart(2, '0')}</strong><small>Tất cả khóa học đã đăng ký</small></div><div><span>ĐANG HỌC</span><strong>{enrollments.filter((x) => x.status === 'in-progress' || x.status === 'approved').length.toString().padStart(2, '0')}</strong><small>Đã xác nhận hoặc đang học</small></div><div><span>KẾT QUẢ ĐÁNH GIÁ</span><strong>{examResults.length.toString().padStart(2, '0')}</strong><small>Bản ghi kiểm tra/thi</small></div></div>
      <section className="dashboard-panel"><div className="panel-title-row"><div><div className="eyebrow">HÀNH TRÌNH HỌC TẬP</div><h2>Khóa học của tôi</h2></div><a href="/courses" className="text-link">Tìm khóa học ↗</a></div>{enrollments.length ? <div className="enrollment-list">{enrollments.map((item) => <article className="enrollment-row" key={item._id}><div className="mini-course-icon">{item.course?.category || 'DW'}</div><div className="enrollment-info"><strong>{item.course?.title || 'Khóa học đã lưu'}</strong><span>{item.course?.code} · {item.course?.durationWeeks} tuần · {money(item.course?.tuition)}</span></div><span className={`status-pill status-${item.status}`}>{statusText[item.status] || item.status}</span></article>)}</div> : <div className="empty-inline"><span>↗</span><div><strong>Hành trình mới đang chờ bạn</strong><p>Chọn một khóa học để gửi đăng ký. Trung tâm sẽ cập nhật trạng thái tại đây.</p><a className="text-link" href="/courses">Khám phá khóa học ↗</a></div></div>}</section>
      <section className="dashboard-panel"><div className="panel-title-row"><div><div className="eyebrow">THEO DÕI ĐÁNH GIÁ</div><h2>Kết quả thi / kiểm tra</h2></div></div>{examResults.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Khóa học</th><th>Loại</th><th>Điểm</th><th>Kết quả</th><th>Ngày</th></tr></thead><tbody>{examResults.map((x) => <tr key={x._id}><td>{x.course?.title}</td><td>{x.examType === 'theory' ? 'Lý thuyết' : 'Thực hành'}</td><td>{x.score}/100</td><td>{x.passed ? 'Đạt' : 'Chưa đạt'}</td><td>{new Date(x.takenAt).toLocaleDateString('vi-VN')}</td></tr>)}</tbody></table></div> : <p className="muted">Chưa có kết quả đánh giá được cập nhật.</p>}</section>
      <section className="dashboard-panel"><div className="panel-title-row"><div><div className="eyebrow">LỊCH HỌC</div><h2>Lịch đào tạo của tôi</h2></div></div>{schedules.length ? <div className="enrollment-list">{schedules.map((item) => <article className="enrollment-row" key={item._id}><div className="mini-course-icon">{item.sessionType === 'practice' ? 'TH' : item.sessionType === 'exam' ? 'THI' : 'LT'}</div><div className="enrollment-info"><strong>{item.course?.title || 'Lịch đào tạo'}</strong><span>{new Date(item.startsAt).toLocaleString('vi-VN')} · {item.location}</span></div><span className="status-pill status-approved">{item.status === 'scheduled' ? 'Đã lên lịch' : item.status}</span></article>)}</div> : <p className="muted">Lịch sẽ xuất hiện khi hồ sơ đăng ký đã được xác nhận và trung tâm tạo lịch.</p>}</section>
    </> : <>
      <div className="dashboard-stats"><div><span>KHÓA HỌC QUẢN LÝ</span><strong>{courses.length.toString().padStart(2, '0')}</strong><small>{user.role === 'admin' ? 'Bao gồm cả bản nháp' : 'Khóa học bạn phụ trách'}</small></div><div><span>HỒ SƠ ĐĂNG KÝ</span><strong>{allEnrollments.length.toString().padStart(2, '0')}</strong><small>Hồ sơ được quản lý</small></div><div><span>VAI TRÒ</span><strong>{user.role === 'admin' ? 'A' : 'I'}</strong><small>{roleName}</small></div></div>
      <CourseManager refresh={refresh} users={users} courses={courses} isAdmin={user.role === 'admin'} />
      {user.role === 'admin' && <UserManager users={users} refresh={refresh} />}
      <EnrollmentManager enrollments={allEnrollments} refresh={refresh} />
      <ScheduleManager courses={courses} refresh={refresh} />
      <LessonManager courses={courses} refresh={refresh} />
      <ExamResultManager courses={courses} students={users.filter((person) => person.role === 'student')} refresh={refresh} />
      <section className="dashboard-panel"><div className="panel-title-row"><div><div className="eyebrow">LỊCH ĐÀO TẠO</div><h2>Lịch học sắp tới</h2></div></div>{schedules.length ? <div className="enrollment-list">{schedules.map((item) => <article className="enrollment-row" key={item._id}><div className="mini-course-icon">{item.sessionType === 'practice' ? 'TH' : item.sessionType === 'exam' ? 'THI' : 'LT'}</div><div className="enrollment-info"><strong>{item.course?.title || 'Lịch đào tạo'}</strong><span>{new Date(item.startsAt).toLocaleString('vi-VN')} · {item.location}</span></div><span className="status-pill status-approved">{item.status === 'scheduled' ? 'Đã lên lịch' : item.status}</span></article>)}</div> : <p className="muted">Chưa có lịch đào tạo nào.</p>}</section>
      <section className="dashboard-panel"><div className="panel-title-row"><div><div className="eyebrow">DANH MỤC</div><h2>Khóa học hiện tại</h2></div><a className="text-link" href="/courses">Xem trang khóa học ↗</a></div><div className="course-grid">{courses.filter((course) => course.status === 'published').slice(0, 3).map((course) => <CourseCard key={course._id} course={course} compact />)}</div></section>
    </>}
    <div className="dashboard-footnote">DriveWise prototype · Dữ liệu phục vụ minh họa môn Mẫu thiết kế phần mềm.</div>
  </main>;
}
