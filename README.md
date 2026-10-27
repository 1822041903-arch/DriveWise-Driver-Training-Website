# DriveWise — Website đào tạo lái xe (MERN)

Prototype phục vụ môn **Mẫu thiết kế phần mềm** — đề tài: **Xây dựng thiết kế website chuyên về đào tạo lái xe**.

> Đây là sản phẩm mẫu phục vụ học tập/demo. Học phí và các khóa học trong dữ liệu seed là dữ liệu minh họa, không phải báo giá hoặc thông báo tuyển sinh của một trung tâm thực tế. Chức năng thanh toán trực tuyến chưa được tích hợp.

## 1. Phạm vi chức năng

### Frontend (React + Vite)
- Trang giới thiệu DriveWise, quy trình học và khóa học nổi bật.
- Danh mục khóa học; lọc theo hạng, tìm theo tên/mã.
- Đăng ký, đăng nhập, đăng xuất; lưu JWT trong `localStorage` cho prototype.
- Học viên: đăng ký khóa học, xem trạng thái hồ sơ, xem kết quả thi/kiểm tra.
- Quản trị viên: tạo khóa học qua giao diện Dashboard.
- Giảng viên/quản trị: khu vực Dashboard hiển thị lịch đào tạo và khóa học; API hỗ trợ thêm bài học/lịch, xác nhận hồ sơ và ghi nhận kết quả.
- Giao diện responsive cho máy tính và điện thoại.

### Backend (Node.js + Express + Mongoose)
- Auth: `register`, `login`, `me`.
- Users: quản trị viên xem danh sách và cập nhật vai trò.
- Courses: list/search/filter/detail/create/update/delete; admin có thể nhân bản khóa học và chương trình bài học thành bản nháp.
- Enrollments: đăng ký, xem hồ sơ cá nhân, xem tất cả hồ sơ (vai trò phù hợp), cập nhật trạng thái qua State Pattern; theo dõi giờ lý thuyết, giờ thực hành và km thực hành.
- Lessons: xem bài học của khóa, tạo bài học.
- Schedules: xem và tạo lịch đào tạo.
- Exam results: học viên xem kết quả; giảng viên/quản trị ghi kết quả qua Strategy Pattern (chiến lược lý thuyết/thực hành).
- JWT authentication, role-based authorization, kiểm tra dữ liệu cơ bản, unique index, xử lý lỗi API.

### Tester / QA
- Automated test bằng `node:test`: unit test kiểm tra dữ liệu khóa học và integration test endpoint health.
- Checklist kiểm thử thủ công và expected result: `docs/test-plan.md`.
- API reference: `docs/api-reference.md`.

## 2. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| FE | React 19, Vite 8, React Router, Axios, CSS responsive |
| BE | Node.js 18+, Express 4, JWT, bcryptjs, Helmet, CORS |
| Database | MongoDB + Mongoose |
| Tester | Node built-in test runner (`node:test`) + kiểm thử thủ công |
| Thiết kế | Mermaid: ERD, Class Diagram, Use Case, Sequence, Activity, Component Architecture, State Diagram |

## 3. Yêu cầu trước khi chạy

- Node.js 22.12 trở lên (khuyến nghị Node.js 22 LTS) và npm. Vite hiện yêu cầu Node.js 20.19+ hoặc 22.12+; xem hướng dẫn chính thức của Vite nếu máy báo sai phiên bản: https://vite.dev/guide/ .
- MongoDB đang chạy local hoặc một MongoDB URI hợp lệ.
- Hai terminal riêng cho Backend và Frontend.

## 4. Cài đặt và chạy

### Bước A — Backend

```bash
cd backend
npm install
```

Sao chép `.env.example` thành `.env`, rồi cập nhật cấu hình:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/driver_training
JWT_SECRET=thay_bang_chuoi_bi_mat_dai_va_ngau_nhien
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

Khởi tạo dữ liệu mẫu:

```bash
npm run seed
```

Khởi động API:

```bash
npm run dev
```

Kiểm tra API bằng trình duyệt hoặc `curl`:

```text
http://localhost:5000/api/health
http://localhost:5000/api/courses
```

### Bước B — Frontend

Mở terminal mới:

```bash
cd frontend
npm install
```

Sao chép `.env.example` thành `.env` nếu API không nằm ở `http://localhost:5000/api`. Sau đó chạy:

```bash
npm run dev
```

Mở URL Vite in trong terminal (thông thường là `http://localhost:5173`).

### Tài khoản demo

Các tài khoản được tạo bởi `npm run seed`:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Quản trị viên | `admin@laixe.local` | `Admin123!` |
| Giảng viên | `giangvien@laixe.local` | `Teacher123!` |
| Học viên | `hocvien@laixe.local` | `Student123!` |

Chỉ dùng thông tin này trong môi trường demo local. Thay `JWT_SECRET` và đổi thông tin đăng nhập trước khi đưa lên môi trường thật.

## 5. Kiến trúc và thiết kế

```text
Browser (React/Vite)
  ├── Pages + reusable components
  ├── AuthContext (trạng thái đăng nhập)
  └── Axios client ────── HTTP/JSON + JWT ──────┐
                                                v
                                      Express REST API
                                        ├── Auth middleware
                                        ├── Role middleware
                                        ├── Routes + validation
                                        └── Mongoose models
                                                |
                                                v
                                            MongoDB
```

Sơ đồ chi tiết và phần giải thích nằm trong [`docs/diagrams.md`](docs/diagrams.md); phần mẫu thiết kế được giải thích và liên kết trực tiếp với source trong [`docs/design-patterns.md`](docs/design-patterns.md). Các file `.mmd` riêng nằm tại `docs/diagrams/` để mở trong Mermaid editor. Nếu dùng Diagrams.so, hãy sao chép prompt ngôn ngữ tự nhiên từ [`docs/diagrams-so-prompts.md`](docs/diagrams-so-prompts.md), không dán mã Mermaid trực tiếp.

## 6. Mẫu thiết kế / nguyên tắc thiết kế được áp dụng

1. **Layered Architecture:** tách Frontend, REST API và tầng lưu trữ dữ liệu. FE không truy cập DB trực tiếp.
2. **MVC theo hướng Express:** Model là các Mongoose schema; View nằm ở React; Controller/Controller-like handlers nằm trong Express route handlers. Với đồ án lớn hơn, có thể tách logic route sang `controllers/` và nghiệp vụ sang `services/`.
3. **Prototype Pattern:** `backend/src/patterns/coursePrototype.js` và `POST /api/courses/:id/clone` nhân bản Course + Lessons thành một lớp mới ở trạng thái `draft`. Lịch cụ thể, hồ sơ và kết quả không được sao chép.
4. **State Pattern:** `backend/src/patterns/enrollmentState.js` kiểm soát chuyển trạng thái `pending`, `approved`, `in-progress`, `completed`, `cancelled` và điều kiện đăng ký lại.
5. **Strategy Pattern:** `backend/src/patterns/examScoringStrategy.js` tách chiến lược tính đạt cho lý thuyết và thực hành. Ngưỡng chỉ mang tính demo, không phải quy định thi thật.
6. **Chain of Responsibility:** middleware Express xử lý request tuần tự qua security/body parser, JWT, role authorization, validation và route handler.
7. **Singleton:** `backend/src/config/db.js` cache promise để các lời gọi dùng lại kết nối Mongoose.
8. **RBAC + Layered Architecture:** giới hạn API theo `student`, `instructor`, `admin`; FE chỉ truy cập dữ liệu qua REST API.
9. **Reusable Components / Centralized API Client:** Navbar, CourseCard, Auth pages, Dashboard và Axios API client được tái sử dụng.

## 7. Vai trò nhóm FE / BE / Tester

| Vai trò | Công việc đề xuất | File/thư mục liên quan |
|---|---|---|
| FE Developer | Layout, responsive UI, form, filter, auth state, gọi API, hiển thị lỗi/trạng thái | `frontend/src/` |
| BE Developer | API, schema, xác thực, phân quyền, validation, xử lý lỗi, seed dữ liệu | `backend/src/` |
| Tester / QA | Kiểm thử API, quyền truy cập, dữ liệu sai, luồng nghiệp vụ và hồi quy UI | `backend/tests/`, `docs/test-plan.md` |

## 8. Chạy kiểm thử

```bash
cd backend
npm test
# Hoặc chỉ chạy unit test thuần, không cần MongoDB:
npm run test:unit
```

Các test hiện có:
- Khóa học hợp lệ được chấp nhận; payload sai bị từ chối.
- Prototype Pattern: nhân bản thông tin khóa học và bài học, đảm bảo bản sao là `draft` và không dùng chung mảng learning outcomes.
- State Pattern: kiểm tra chuyển trạng thái hợp lệ, từ chối chuyển bất hợp lệ và kiểm tra điều kiện đăng ký lại.
- Strategy Pattern: kết quả lý thuyết và thực hành được đánh giá bằng ngưỡng demo riêng.
- Integration test `GET /api/health` cần cài dependencies để chạy.

Danh sách test case thủ công, precondition và expected result: xem [`docs/test-plan.md`](docs/test-plan.md).

## 9. API quan trọng

| Method | Endpoint | Quyền |
|---|---|---|
| GET | `/api/health` | Public |
| POST | `/api/auth/register` | Public; chỉ tạo student |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Đăng nhập |
| GET | `/api/users?q=&role=` | Admin |
| PATCH | `/api/users/:id/role` | Admin |
| GET | `/api/courses?q=&category=` | Public; quản trị/giảng viên có thể chọn `status` |
| GET | `/api/courses/:id` | Public cho khóa published |
| POST | `/api/courses` | Admin / instructor |
| POST | `/api/courses/:id/clone` | Admin (Prototype Pattern) |
| PATCH | `/api/courses/:id` | Admin / instructor (giảng viên chỉ sửa khóa của mình) |
| DELETE | `/api/courses/:id` | Admin |
| POST | `/api/enrollments` | Student |
| GET | `/api/enrollments/my` | Student |
| GET | `/api/enrollments` | Admin / instructor |
| PATCH | `/api/enrollments/:id/status` | Admin / instructor; State Pattern kiểm tra chuyển trạng thái |
| PATCH | `/api/enrollments/:id/progress` | Admin / instructor |
| GET | `/api/lessons/course/:courseId` | Public trong prototype |
| POST | `/api/lessons` | Admin / instructor |
| GET | `/api/schedules` | Authenticated; lọc theo vai trò |
| POST | `/api/schedules` | Admin / instructor |
| GET | `/api/exam-results/my` | Student |
| POST | `/api/exam-results` | Admin / instructor |

Xem [`docs/api-reference.md`](docs/api-reference.md) để biết ví dụ payload.

## 10. Giới hạn và hướng phát triển

- Chưa tích hợp cổng thanh toán, email/SMS, upload tài liệu, thông báo real-time hoặc đăng nhập OAuth.
- Lịch hiện lưu và hiển thị theo API; chưa có giao diện lịch dạng calendar và chưa phát hiện trùng giờ tự động.
- Nên bổ sung phân trang, audit log, refresh token, rate limiting, kiểm tra URL video/tài liệu, kiểm soát lịch sử trạng thái và kiểm thử tích hợp DB trước khi triển khai thực tế.
- Khi triển khai thật, bắt buộc dùng HTTPS, secrets qua môi trường triển khai, chính sách backup DB và kiểm tra bảo mật bổ sung.
