# Bộ sơ đồ thiết kế hệ thống DriveWise

Các sơ đồ nguồn được viết bằng Mermaid, phù hợp với trình render Mermaid (ví dụ Mermaid Live Editor). **Diagrams.so tạo sơ đồ từ mô tả ngôn ngữ tự nhiên và không nhận trực tiếp cú pháp Mermaid**, vì vậy nếu dùng diagrams.so hãy làm theo các prompt tại `docs/diagrams-so-prompts.md`. Nội dung dưới đây giải thích mục đích và cách đọc từng sơ đồ.

## 1. Use Case Diagram — Sơ đồ chức năng

**Mục tiêu:** Xác định các nhóm người dùng và chức năng họ được phép sử dụng.

- **Khách truy cập:** xem/tìm khóa học, tạo tài khoản và đăng nhập.
- **Học viên:** gửi đăng ký khóa học, theo dõi hồ sơ, xem lịch và kết quả.
- **Giảng viên:** quản lý khóa học mình phụ trách, bài học, lịch đào tạo, trạng thái hồ sơ và kết quả thi.
- **Quản trị viên:** thao tác quản lý dữ liệu rộng hơn, bao gồm quản lý khóa học, hồ sơ và chức năng quản trị.

**Cách đọc:** Hình chữ nhật bo tròn là use case; mũi nối cho biết actor tham gia use case. Đây là góc nhìn chức năng, chưa thể hiện thứ tự xử lý.

## 2. ERD — Sơ đồ thực thể quan hệ

**Mục tiêu:** Thiết kế dữ liệu cần lưu trong MongoDB và các quan hệ giữa các collection.

| Thực thể | Ý nghĩa |
|---|---|
| `USERS` | Tài khoản; `role` phân biệt student, instructor, admin. |
| `COURSES` | Khóa học, hạng đào tạo, thời lượng, học phí, chỉ tiêu và giảng viên phụ trách. |
| `ENROLLMENTS` | Bảng liên kết học viên với khóa học; một học viên có thể đăng ký nhiều khóa. Cặp `student + course` không được trùng. |
| `LESSONS` | Bài học lý thuyết/thực hành nằm trong một khóa học. |
| `SCHEDULES` | Lịch đào tạo, thời gian, địa điểm, loại buổi và người hướng dẫn/học viên nếu đã gán. |
| `EXAM_RESULTS` | Kết quả đánh giá của học viên đối với một khóa học; lưu điểm, loại bài thi và người ghi nhận. |

**Cách đọc ký hiệu:** `||` là đúng một; `o{` là không hoặc nhiều; `FK` là khóa tham chiếu; `PK` là định danh chính; `UK` là giá trị duy nhất. Các ObjectId trong MongoDB đóng vai trò tham chiếu giữa document.

**Quy tắc dữ liệu quan trọng:** email người dùng và mã khóa học duy nhất; mỗi cặp học viên–khóa học duy nhất; bài học có thứ tự trong từng khóa; `SCHEDULES.lessonId` là tham chiếu tùy chọn tới bài học thuộc đúng khóa; `ENROLLMENTS` theo dõi giờ lý thuyết, giờ thực hành và km thực hành hoàn thành; điểm nằm trong khoảng 0–100. Đây là mô hình phục vụ prototype; số giờ/km thực tế phải được kiểm tra theo quy định hiện hành nếu triển khai thật.

## 3. Class Diagram — Sơ đồ lớp

**Mục tiêu:** Mô tả cấu trúc đối tượng và trách nhiệm chính trong thiết kế.

- `User`, `Course`, `Enrollment`, `Lesson`, `Schedule`, `ExamResult` là các lớp miền nghiệp vụ tương ứng với các Mongoose model.
- Các quan hệ thể hiện ai dạy khóa học, khóa học chứa bài học, học viên đăng ký khóa học, lịch gắn với khóa học và kết quả thi.
- `AuthRoutes`, `UserRoutes`, `CourseRoutes`, `EnrollmentRoutes`, `LessonRoutes`, `ScheduleRoutes`, `ExamResultRoutes` khớp với các module route trong source code.
- **Prototype Pattern:** `coursePrototype.js` tạo bản sao khóa học thành `draft` và nhân bản các `Lesson`; không sao chép enrollment, kết quả thi hoặc lịch thật vì lịch mang thời gian/giảng viên cụ thể.
- **State Pattern:** `enrollmentState.js` quyết định chuyển trạng thái hợp lệ; đăng ký lại từ `cancelled` chỉ được phép nếu khóa học đang `published` và còn chỉ tiêu.
- **Strategy Pattern:** `examScoringStrategy.js` tách quy tắc đánh giá lý thuyết và thực hành; Backend tự tính `passed`.
- **Chain of Responsibility:** Express chuyển request qua security/body parser, `requireAuth`, `allowRoles`, validation và handler; lỗi được chuyển tới central error handler.
- **Singleton:** module `config/db.js` cache promise kết nối để các lần gọi `connectDB()` tái sử dụng một kết nối Mongoose.

Mũi tên nét liền biểu thị quan hệ dữ liệu/kế thừa; nét đứt biểu thị phụ thuộc giữa các route/service/middleware. Các lớp State được vẽ theo cấu trúc thật của code demo.

## 4. Sequence Diagram — Luồng đăng ký khóa học

**Mục tiêu:** Thể hiện thứ tự thông điệp khi học viên đăng ký.

1. Người dùng nhấn đăng ký trên React UI.
2. Frontend gửi `POST /api/enrollments` kèm `courseId` và JWT.
3. Middleware xác thực token, tải user và kiểm tra vai trò.
4. API xác nhận khóa học đang mở, kiểm tra chỉ tiêu và hồ sơ trùng.
5. Nếu hợp lệ, MongoDB lưu enrollment trạng thái `pending`, API trả HTTP 201.
6. Nếu không hợp lệ, API trả mã lỗi 4xx và thông báo lý do.

**Điểm thiết kế:** Mọi kiểm tra quan trọng đều thực hiện lại ở Backend; không dựa riêng vào giao diện, vì dữ liệu gửi từ trình duyệt có thể bị sửa đổi.

## 5. Activity Diagram — Quy trình nghiệp vụ đăng ký

**Mục tiêu:** Diễn tả quy trình từ chọn khóa tới khi học viên theo dõi việc học.

Các nút hình thoi là điểm quyết định, ví dụ đã đăng nhập hay chưa và điều kiện đăng ký có đạt hay không. Nếu chưa đăng nhập, người dùng phải đăng nhập/tạo tài khoản. Sau khi lưu hồ sơ ở trạng thái `pending`, trung tâm có thể xác nhận; nếu duyệt, học viên tiếp tục theo dõi lịch và tiến độ. Trạng thái là luồng nghiệp vụ mẫu, không thay thế quy trình hành chính thật của một trung tâm.

## 6. Component / Architecture Diagram — Sơ đồ kiến trúc

**Mục tiêu:** Phân tách hệ thống thành các thành phần và chỉ ra hướng giao tiếp.

- **Frontend:** React pages/components hiển thị dữ liệu; `AuthContext` giữ trạng thái đăng nhập; Axios client gọi API.
- **Backend:** Express nhận HTTP request; middleware xử lý bảo mật, CORS, xác thực JWT và phân quyền; route kiểm tra input và gọi Mongoose model.
- **Database:** MongoDB lưu users, courses, enrollments, lessons, schedules và exam results.

**Nguyên tắc:** Frontend không truy cập MongoDB trực tiếp. Tất cả thao tác dữ liệu đi qua REST API. JWT chứng minh danh tính; role middleware giới hạn các thao tác theo vai trò.

## 7. State Diagram — Vòng đời hồ sơ đăng ký

**Mục tiêu:** Chuẩn hóa những trạng thái hợp lệ và chuyển trạng thái.

Luồng bình thường của source là `pending → approved → in-progress → completed`. Hồ sơ `pending`, `approved` hoặc `in-progress` có thể bị hủy; `completed` là trạng thái kết thúc. Chỉ có thể chuyển `cancelled → pending` nếu khóa học đang `published` và còn chỗ. Tất cả chuyển đổi do `EnrollmentState`/các lớp trạng thái kiểm soát. Nếu cần audit trail, nên thêm collection lưu lịch sử thay vì chỉ ghi trạng thái mới nhất.

## Cách sử dụng trong báo cáo

1. Đưa **Use Case** vào phần phân tích yêu cầu chức năng.
2. Đưa **ERD** vào phần thiết kế dữ liệu.
3. Đưa **Class Diagram** và **Component Diagram** vào phần thiết kế hệ thống.
4. Đưa **Sequence** và **Activity** vào phần mô tả nghiệp vụ đăng ký.
5. Đưa **State Diagram** vào phần quản lý trạng thái hồ sơ.
6. Viết nhận xét ngắn ngay sau mỗi hình, nêu mục đích, actor/thực thể chính và vì sao thiết kế đó phù hợp.
