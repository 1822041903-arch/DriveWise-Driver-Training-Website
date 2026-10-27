# API Reference — DriveWise

Base URL khi chạy local: `http://localhost:5000/api`. Các request có quyền cần header `Authorization: Bearer <token>`.

## Authentication

### POST `/auth/register`

```json
{
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "password": "Password123!",
  "phone": "0900000000"
}
```

Tạo tài khoản vai trò `student`. Thành công trả về `{ "token": "...", "user": { ... } }`.

### POST `/auth/login`

```json
{ "email": "hocvien@laixe.local", "password": "Student123!" }
```

### GET `/auth/me`

Cần JWT; trả về người dùng hiện đăng nhập.

## Users — chỉ admin

### GET `/users?q=nguyen&role=student`

Trả về danh sách tài khoản không bao gồm trường mật khẩu. Có thể lọc theo vai trò hoặc tìm họ tên/email.

### PATCH `/users/:id/role`

```json
{ "role": "instructor" }
```

Vai trò hợp lệ: `student`, `instructor`, `admin`. Tài khoản quản trị đang đăng nhập không thể tự hạ quyền.

## Courses

### GET `/courses?q=xe&category=B`

Tìm theo tên/mã/mô tả và lọc theo hạng. Mặc định người dùng public chỉ nhìn thấy khóa `published`.

### POST `/courses` — admin/instructor

```json
{
  "title": "Khóa học lái xe B nâng cao",
  "code": "B-002",
  "category": "B",
  "type": "Tổng hợp",
  "description": "Chương trình đào tạo kết hợp lý thuyết và thực hành lái xe.",
  "durationWeeks": 12,
  "tuition": 12000000,
  "seatLimit": 25,
  "status": "published"
}
```

Các category demo hợp lệ: `A1`, `A`, `B`, `C1`, `C`, `D1`, `Khác`. Các hạng chỉ là danh mục của prototype, cần rà soát theo yêu cầu thực tế trước khi triển khai.

### POST `/courses/:id/clone` — admin only (Prototype Pattern)

```json
{
  "title": "Khóa học B - K12",
  "code": "B-K12"
}
```

Tạo một khóa mới ở trạng thái `draft`, sao chép thông tin khóa nguồn và tất cả bài học theo thứ tự. Response có `clonedLessonCount`. Không sao chép học viên, kết quả thi hoặc lịch có ngày giờ cụ thể; quản trị viên cần lên lịch mới và rà soát nội dung trước khi xuất bản.

## Enrollments

### POST `/enrollments` — student

```json
{ "courseId": "<MongoDB Course ObjectId>" }
```

API kiểm tra khóa học đang mở, chỉ tiêu và đăng ký trùng. Hồ sơ mới có trạng thái `pending`.

### GET `/enrollments/my` — student

Trả về hồ sơ đăng ký của người dùng hiện tại cùng thông tin khóa học.

### PATCH `/enrollments/:id/progress` — admin/instructor

```json
{ "theoryHoursCompleted": 12, "practiceHoursCompleted": 8, "practiceKmCompleted": 45.5 }
```

Có thể gửi một hoặc nhiều chỉ số; giá trị phải là số không âm. Chỉ cập nhật khi hồ sơ ở trạng thái `approved` hoặc `in-progress`; giảng viên chỉ cập nhật khóa học mình phụ trách.

### PATCH `/enrollments/:id/status` — admin/instructor

```json
{ "status": "approved" }
```

Các trạng thái: `pending`, `approved`, `in-progress`, `completed`, `cancelled`.

## Lessons

### POST `/lessons` — admin/instructor

```json
{
  "courseId": "<Course ObjectId>",
  "title": "Nhận biết biển báo giao thông",
  "lessonType": "theory",
  "order": 1,
  "summary": "Giới thiệu nhóm biển báo và cách nhận biết.",
  "videoUrl": "",
  "materialsUrl": ""
}
```

### GET `/lessons/course/:courseId`

Trả về bài học theo trường `order` tăng dần.

## Schedules

### GET `/schedules` — authenticated

Trả về lịch phù hợp với vai trò hiện tại: học viên xem lịch liên quan tới hồ sơ của mình; giảng viên xem lịch được phân công; quản trị viên xem toàn bộ theo bộ lọc. Có thể lọc bằng `courseId`, `from`, `to`.

### POST `/schedules` — admin/instructor

```json
{
  "courseId": "<Course ObjectId>",
  "startsAt": "2026-11-02T08:00:00+07:00",
  "endsAt": "2026-11-02T10:00:00+07:00",
  "location": "Sân tập số 1",
  "sessionType": "practice",
  "lessonId": "<Lesson ObjectId - optional>"
}
```

`sessionType`: `theory`, `practice`, `exam`. `lessonId` là tùy chọn và nếu cung cấp phải thuộc đúng khóa học. Thời gian kết thúc phải sau thời gian bắt đầu.

## Exam results

### POST `/exam-results` — admin/instructor

```json
{
  "studentId": "<Student ObjectId>",
  "courseId": "<Course ObjectId>",
  "examType": "theory",
  "score": 85,
  "feedback": "Nắm vững nội dung đã học."
}
```

Backend tự tính `passed` bằng Strategy Pattern: `TheoryExamStrategy` dùng ngưỡng mẫu 50/100 và `PracticeExamStrategy` dùng ngưỡng mẫu 70/100. API không tin trường `passed` do client gửi; phản hồi và bản ghi lưu thêm `passingScore` cùng `scoringStrategy`. Các ngưỡng này chỉ là quy tắc minh họa cho đồ án, **không phải** tiêu chuẩn pháp lý hoặc quy định sát hạch chính thức.
