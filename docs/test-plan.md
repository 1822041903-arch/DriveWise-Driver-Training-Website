# Test Plan — DriveWise

## 1. Mục tiêu

Xác minh các luồng quan trọng hoạt động đúng: xác thực tài khoản, xem khóa học, đăng ký khóa học, phân quyền, quản lý dữ liệu và xử lý input không hợp lệ.

## 2. Phạm vi

- **Unit test tự động:** kiểm tra validator của payload khóa học.
- **Integration test tự động:** kiểm tra endpoint health của Express.
- **Manual/API test:** kiểm thử luồng nghiệp vụ với MongoDB đã seed và frontend chạy.
- **UI test:** kiểm tra responsive, thông báo lỗi và trạng thái nút/form.

## 3. Cách chạy test tự động

```bash
cd backend
npm install
npm test
```

## 4. Danh sách test case

| ID | Loại | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|---|
| TC-01 | API / tự động | Backend app có thể khởi động | Gọi `GET /api/health` | HTTP 200, JSON `{status: "ok", service: "driver-training-api"}` |
| TC-02 | Unit / tự động | Không cần DB | Validate payload khóa học hợp lệ | `valid = true`, danh sách lỗi rỗng |
| TC-03 | Unit / tự động | Không cần DB | Gửi mã sai, hạng sai, mô tả ngắn, thời lượng 0 và học phí âm | `valid = false`, có lỗi validation |
| TC-04 | UI/API | MongoDB chạy, đã seed | Đăng nhập `hocvien@laixe.local` / `Student123!` | Điều hướng tới Dashboard, hiện tên học viên |
| TC-05 | API | Chưa có token | Gọi `POST /api/enrollments` | HTTP 401 |
| TC-06 | API | Đăng nhập student, có courseId published | Gửi `POST /api/enrollments` | HTTP 201; enrollment có trạng thái `pending` |
| TC-07 | API | Student đã đăng ký khóa | Gửi lại cùng courseId | HTTP 409 với thông báo đã đăng ký |
| TC-08 | API | Đăng nhập student | Gọi `POST /api/courses` | HTTP 403, không tạo khóa học |
| TC-09 | API | Đăng nhập admin | Gửi payload khóa học hợp lệ tới `POST /api/courses` | HTTP 201, khóa mới được lưu |
| TC-10 | API | Đăng nhập instructor | Thử sửa khóa do giảng viên khác phụ trách | HTTP 403 |
| TC-11 | API | Có đăng ký tồn tại | Admin cập nhật status sang `approved` | HTTP 200, trạng thái được cập nhật |
| TC-12 | UI | Backend không chạy | Mở `/courses` | Trang hiển thị thông báo kết nối lỗi, không treo giao diện |
| TC-13 | UI | Màn hình điện thoại | Mở trang chủ, khóa học, đăng nhập | Không tràn ngang; nút và form dùng được |
| TC-14 | UI | Chưa đăng nhập | Nhấn đăng ký khóa học | Điều hướng tới trang đăng nhập |
| TC-15 | Validation | Gửi email sai hoặc password < 8 ký tự | Gọi `POST /api/auth/register` | HTTP 400 với thông báo cụ thể |
| TC-16 | Data | Đăng ký cùng student/course hai lần | Thực hiện hai request liên tiếp | Không tạo hồ sơ thứ hai; trả HTTP 409 |

## 5. Tiêu chí chấp nhận

- Tất cả automated tests pass.
- Public chỉ xem khóa học đang `published`.
- API yêu cầu đăng nhập trả 401 khi thiếu/sai JWT.
- API yêu cầu vai trò trả 403 khi vai trò không đủ quyền.
- Không tạo hồ sơ đăng ký trùng cho cùng học viên và khóa học.
- Các form hiển thị thông báo thành công/thất bại rõ ràng.

## 6. Báo cáo kiểm thử cần nộp

Khi chạy test trên máy của nhóm, hãy ghi lại: phiên bản Node/MongoDB, ngày kiểm thử, người thực hiện, số lượng pass/fail, screenshot hoặc response API, lỗi phát hiện và tình trạng retest. Không ghi “pass” cho test chưa thực sự chạy.

## Bổ sung test cho Design Patterns

| ID | Pattern / trường hợp | Dữ liệu đầu vào | Kết quả mong đợi |
|---|---|---|---|
| DP-01 | Prototype nhân bản khóa học | Course K11 + mã/tên K12 | Bản sao có `status=draft`, mã uppercase và dữ liệu curriculum độc lập. |
| DP-02 | Prototype sao chép bài học | Danh sách Lesson nguồn + ID khóa mới | Tất cả Lesson được gán vào khóa mới và giữ thứ tự. |
| DP-03 | State chuyển hợp lệ | `pending → approved` | Trạng thái mới là `approved`. |
| DP-04 | State chặn chuyển không hợp lệ | `pending → completed` | Từ chối với `EnrollmentTransitionError`. |
| DP-05 | State đăng ký lại có điều kiện | `cancelled → pending`, khóa published và còn chỗ | Cho phép chuyển trạng thái. |
| DP-06 | State đăng ký lại bị chặn | Khóa chưa published hoặc hết chỗ | Từ chối, thông báo lý do tương ứng. |
| DP-07 | Strategy chấm lý thuyết | `theory`, điểm 50/100 | Đạt theo ngưỡng demo 50; lưu `TheoryExamStrategy`. |
| DP-08 | Strategy chấm thực hành | `practice`, điểm 69/100 | Không đạt theo ngưỡng demo 70; lưu `PracticeExamStrategy`. |
| DP-09 | Strategy dữ liệu ngoài miền | Điểm -1 hoặc 101 | Ném lỗi validation, API trả dữ liệu không hợp lệ. |
| DP-10 | Prototype endpoint | Admin POST `/api/courses/:id/clone` | HTTP 201, khóa mới `draft`, `clonedLessonCount` đúng. |
| DP-11 | Phân quyền Prototype endpoint | Student/instructor gọi clone endpoint | Bị từ chối do endpoint chỉ cho admin. |
| DP-12 | Schedule tham chiếu Lesson | Gửi `lessonId` thuộc khóa khác | HTTP 400, không tạo lịch. |
| DP-13 | Tiến độ đào tạo | Chỉ số âm hoặc hồ sơ chưa được duyệt | HTTP 400/409, không lưu giá trị không hợp lệ. |

### Chạy unit test thuần (không cần MongoDB)

Tại thư mục `backend`; chỉ cần Node.js, không cần MongoDB hay thư viện ngoài cho hai file test này:

```bash
npm run test:unit
```

### Integration test

Để chạy `tests/health.test.js` và kiểm thử API/Mongoose, cần cài dependencies trong `backend` và chạy với môi trường Node.js/MongoDB phù hợp. Test plan mô tả expected result; không coi test thủ công là đã thực thi tự động.

**Lưu ý ngưỡng điểm:** điểm 50/100 cho lý thuyết và 70/100 cho thực hành là quy ước demo cho đồ án, không phải quy tắc thi sát hạch chính thức.

