require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('Hãy cấu hình MONGODB_URI trong file .env');
  await mongoose.connect(process.env.MONGODB_URI);
  const users = [
    { fullName: 'Quản trị viên mẫu', email: 'admin@laixe.local', password: 'Admin123!', role: 'admin' },
    { fullName: 'Giảng viên mẫu', email: 'giangvien@laixe.local', password: 'Teacher123!', role: 'instructor' },
    { fullName: 'Học viên mẫu', email: 'hocvien@laixe.local', password: 'Student123!', role: 'student' }
  ];
  const saved = {};
  for (const data of users) {
    const password = await bcrypt.hash(data.password, 12);
    saved[data.role] = await User.findOneAndUpdate({ email: data.email }, { ...data, password }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  const courses = [
    { code: 'B-001', title: 'Khóa học lái xe ô tô hạng B', category: 'B', type: 'Tổng hợp', description: 'Lộ trình kết hợp lý thuyết luật giao thông, mô phỏng tình huống và thực hành lái xe cùng giảng viên.', durationWeeks: 16, tuition: 14500000, seatLimit: 30, instructor: saved.instructor._id, status: 'published', learningOutcomes: ['Nắm kiến thức luật giao thông', 'Rèn luyện kỹ năng điều khiển xe', 'Chuẩn bị cho kỳ kiểm tra cuối khóa'] },
    { code: 'A1-001', title: 'Khóa học xe máy hạng A1', category: 'A1', type: 'Lý thuyết', description: 'Học kiến thức nền tảng về biển báo, quy tắc giao thông và kỹ năng an toàn khi tham gia giao thông.', durationWeeks: 4, tuition: 1200000, seatLimit: 40, instructor: saved.instructor._id, status: 'published', learningOutcomes: ['Nhận biết biển báo', 'Hiểu quy tắc giao thông cơ bản', 'Ôn tập câu hỏi lý thuyết'] },
    { code: 'C1-001', title: 'Khóa học lái xe hạng C1', category: 'C1', type: 'Tổng hợp', description: 'Chương trình minh họa dành cho người học lái xe tải, kết hợp kiến thức lý thuyết và lịch thực hành.', durationWeeks: 20, tuition: 18500000, seatLimit: 20, instructor: saved.instructor._id, status: 'published', learningOutcomes: ['Củng cố luật giao thông', 'Thực hành thao tác xe', 'Theo dõi tiến độ học tập'] }
  ];
  for (const data of courses) await Course.findOneAndUpdate({ code: data.code }, data, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('Seed hoàn tất. Tài khoản mẫu: admin@laixe.local / Admin123!; giangvien@laixe.local / Teacher123!; hocvien@laixe.local / Student123!');
  await mongoose.disconnect();
}
seed().catch(async (error) => { console.error(error); await mongoose.disconnect(); process.exit(1); });
