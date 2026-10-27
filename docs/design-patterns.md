# Design Patterns được hiện thực trong DriveWise

Tài liệu này liên kết từng mẫu thiết kế với mã nguồn, API và test cụ thể. Mục đích là để Class Diagram không chứa những lớp “trang trí” không tồn tại trong project.

## 1. Prototype — Nhân bản khóa đào tạo

**Vấn đề:** Khi mở lớp mới (ví dụ K12 dựa trên K11), người quản trị không nên nhập lại toàn bộ mô tả khóa học và thứ tự các bài học.

**Cách áp dụng trong DriveWise:**

- `backend/src/patterns/coursePrototype.js`: `buildCoursePrototype()` tạo payload khóa học mới; `buildLessonPrototypes()` tạo các bài học sao chép và gắn `course` vào ID khóa mới.
- `backend/src/routes/courses.js`: `POST /api/courses/:id/clone` chỉ dành cho `admin`.
- Form “Nhân bản khóa học mẫu” trong Dashboard quản trị gọi API trên.
- Bản sao luôn ở `status: draft`; quản trị viên kiểm tra lại trước khi xuất bản.

Ví dụ request:

```http
POST /api/courses/<courseId>/clone
Authorization: Bearer <admin-token>
Content-Type: application/json
```

```json
{
  "title": "Khóa B - K12",
  "code": "B-K12"
}
```

API trả về khóa học mới và `clonedLessonCount`. Hệ thống không sao chép enrollment, kết quả thi hoặc `Schedule` cụ thể vì các dữ liệu đó gắn với học viên, ngày giờ và giảng viên của lớp nguồn. Lịch đào tạo của lớp mới cần được thiết lập lại; đây là quyết định nghiệp vụ để tránh sao chép nhầm ngày học cũ.

**Test:** `backend/tests/designPatterns.test.js` kiểm tra bản sao dùng mảng learning outcomes độc lập, có mã uppercase và được đặt ở trạng thái `draft`.

## 2. State — Vòng đời hồ sơ đăng ký

**Vấn đề:** Không phải chuyển trạng thái nào cũng hợp lệ. Ví dụ `pending → completed` hoặc `completed → cancelled` phải bị chặn.

**Cách áp dụng:** `backend/src/patterns/enrollmentState.js` định nghĩa `PendingState`, `ApprovedState`, `InProgressState`, `CompletedState`, `CancelledState` và hàm điều phối `transitionEnrollment()`. API `PATCH /api/enrollments/:id/status` gọi hàm này trước khi lưu trạng thái.

Các chuyển trạng thái chính:

| Từ | Sang | Ý nghĩa |
|---|---|---|
| `pending` | `approved` | Hồ sơ được duyệt |
| `pending` | `cancelled` | Hồ sơ bị từ chối/hủy |
| `approved` | `in-progress` | Bắt đầu đào tạo |
| `approved` | `cancelled` | Hủy trước khi học |
| `in-progress` | `completed` | Hoàn thành khóa |
| `in-progress` | `cancelled` | Dừng học |
| `cancelled` | `pending` | Đăng ký lại, chỉ khi khóa `published` và còn chỗ |

`completed` là trạng thái kết thúc. Với `cancelled → pending`, Backend kiểm tra `coursePublished` và `hasAvailableSeat`. Mỗi cặp student-course dùng unique index nên đăng ký lại tái sử dụng hồ sơ cũ thay vì tạo document thứ hai.

**Test:** `tests/designPatterns.test.js` kiểm tra nhánh hợp lệ, nhánh không hợp lệ và guard điều kiện đăng ký lại.

## 3. Strategy — Chấm điểm theo loại đánh giá

**Vấn đề:** Không nên gắn một ngưỡng đạt duy nhất vào endpoint cho mọi loại bài đánh giá.

**Cách áp dụng:** `backend/src/patterns/examScoringStrategy.js` định nghĩa `ExamScoringStrategy`, `TheoryExamStrategy` và `PracticeExamStrategy`. `POST /api/exam-results` chọn chiến lược dựa trên `examType`, tính `passed` ở Backend và lưu `passingScore` cùng `scoringStrategy` để có thể giải thích cách đánh giá.

| Loại | Chiến lược demo | Ngưỡng demo |
|---|---|---:|
| `theory` | `TheoryExamStrategy` | 50/100 |
| `practice` | `PracticeExamStrategy` | 70/100 |

**Cảnh báo:** Các ngưỡng này chỉ là số giả định để minh họa Design Pattern trong đồ án; chúng **không phải** điểm chuẩn hay quy định sát hạch lái xe chính thức. Nếu đưa vào hệ thống thật, ngưỡng phải được cấu hình từ quy chế có thẩm quyền và đúng cách chấm từng hạng bằng.

**Test:** kiểm tra điểm đúng ngưỡng, điểm dưới ngưỡng và từ chối điểm ngoài khoảng 0–100.

## 4. Chain of Responsibility — Chuỗi middleware Express

**Vấn đề:** Yêu cầu HTTP cần đi qua các bước bảo mật, xác thực, phân quyền và kiểm tra dữ liệu; mỗi middleware có thể từ chối yêu cầu hoặc dùng `next()` chuyển điều khiển cho mắt xích tiếp theo.

**Cách áp dụng trong code:**

1. Middleware toàn cục: Helmet → CORS → JSON body parser.
2. Với endpoint bảo vệ: `requireAuth` xác thực JWT và tải User.
3. `allowRoles(...)` kiểm tra vai trò.
4. `validateEnrollmentRequest` kiểm tra sự tồn tại/định dạng `courseId` trên `POST /api/enrollments`.
5. Route handler kiểm tra quy tắc nghiệp vụ và gọi model/service.
6. Middleware cuối trong `app.js` trả lỗi tập trung.

Không phải endpoint nào cũng yêu cầu JWT: `/api/health` và việc đọc danh mục khóa `published` có thể public. Vì vậy chuỗi xác thực/phân quyền áp dụng cho các route có bảo vệ, không phải mọi request vô điều kiện.

## 5. Singleton — Kết nối MongoDB

`backend/src/config/db.js` cache `connectionPromise` ở phạm vi module. Nhiều lần gọi `connectDB()` dùng lại promise/kết nối đang khởi tạo hoặc kết nối đã mở thay vì mở kết nối độc lập mỗi lần. Đây là Singleton theo phạm vi module Node.js, không phải một class Singleton cổ điển với constructor công khai.

## 6. Cách liên hệ các mẫu với sơ đồ

- **Class Diagram:** hiển thị module route, model miền nghiệp vụ, các lớp State cụ thể, các strategy và service Prototype.
- **Component/Architecture Diagram:** cho thấy chuỗi middleware và vị trí của các pattern trong hệ thống 3 tầng.
- **Sequence Diagram:** trình bày thứ tự xác thực/kiểm tra cho luồng đăng ký; nếu cần demo sâu, có thể mô tả thêm sequence clone khóa và chấm thi từ các API tương ứng.
- **State Diagram:** minh họa trạng thái nghiệp vụ `Enrollment`; đây là trạng thái của đối tượng, còn State Pattern là kỹ thuật tổ chức mã để kiểm soát chuyển trạng thái.

Chỉ giữ các lớp/quan hệ khớp với code. Khi thay đổi enum, route hoặc thuật toán, cập nhật đồng thời source code, test, ERD/Class Diagram và tài liệu API.
