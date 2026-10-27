# Tài liệu phân tích & thiết kế hệ thống DriveWise

## 1. Tổng quan đề tài

**Tên đề tài:** Xây dựng thiết kế website chuyên về đào tạo lái xe.

**Tên prototype:** DriveWise — Học lái xe thông minh.

**Mục tiêu:** Tạo một cổng web mẫu để người học tìm hiểu khóa đào tạo, gửi đăng ký, theo dõi trạng thái học tập; đồng thời hỗ trợ trung tâm quản lý khóa học, nội dung bài học, lịch đào tạo và kết quả đánh giá.

**Phạm vi phiên bản MVP:** Tập trung vào quản lý quy trình đào tạo ở mức thông tin. Chưa tích hợp thanh toán, xác minh hồ sơ pháp lý, dịch vụ email/SMS hoặc cổng thi sát hạch bên ngoài.

## 2. Tác nhân hệ thống

| Tác nhân | Vai trò |
|---|---|
| Khách truy cập | Xem và tìm kiếm chương trình đào tạo; đăng ký tài khoản học viên. |
| Học viên (`student`) | Đăng nhập, đăng ký khóa học, theo dõi hồ sơ, xem lịch học và kết quả được cập nhật. |
| Giảng viên (`instructor`) | Quản lý khóa học được phân công, thêm bài học, tạo lịch, cập nhật hồ sơ và ghi nhận kết quả. |
| Quản trị viên (`admin`) | Quản lý khóa học, phân công giảng viên, cập nhật vai trò tài khoản, xem và điều phối hồ sơ. |

## 3. Yêu cầu chức năng

| Mã | Yêu cầu | Mức ưu tiên |
|---|---|---|
| FR-01 | Hệ thống cho phép khách truy cập xem danh mục và tìm kiếm khóa học. | Cao |
| FR-02 | Hệ thống cho phép đăng ký tài khoản học viên và đăng nhập bằng email/mật khẩu. | Cao |
| FR-03 | Học viên có thể gửi yêu cầu đăng ký một khóa học đang mở. | Cao |
| FR-04 | Hệ thống kiểm tra đăng ký trùng và chỉ tiêu học viên. | Cao |
| FR-05 | Học viên xem danh sách hồ sơ cùng trạng thái hiện tại. | Cao |
| FR-06 | Quản trị viên/giảng viên tạo và cập nhật thông tin khóa học theo quyền. | Cao |
| FR-07 | Quản trị viên cập nhật vai trò tài khoản. | Trung bình |
| FR-08 | Giảng viên/quản trị tạo bài học gắn với khóa học. | Trung bình |
| FR-09 | Giảng viên/quản trị tạo lịch học hoặc lịch thi; học viên xem lịch phù hợp. | Trung bình |
| FR-10 | Giảng viên/quản trị ghi nhận điểm và phản hồi; học viên xem kết quả của mình. | Trung bình |
| FR-11 | API trả về thông báo lỗi có ý nghĩa khi dữ liệu sai hoặc tài khoản không đủ quyền. | Cao |

## 4. Yêu cầu phi chức năng

- **Bảo mật:** mật khẩu được băm bằng bcrypt; API riêng tư yêu cầu JWT; API nhạy cảm kiểm tra role ở Backend.
- **Tính toàn vẹn dữ liệu:** email và mã khóa học duy nhất; ràng buộc một hồ sơ cho mỗi cặp học viên/khóa học; kiểm tra miền giá trị của điểm, học phí, thời lượng và trạng thái.
- **Khả năng sử dụng:** giao diện tiếng Việt, phản hồi rõ ràng khi thao tác thành công/thất bại, có bố cục cho điện thoại và máy tính.
- **Khả năng bảo trì:** tách model, route, middleware và validator; cấu hình qua `.env`; các component FE dùng lại được.
- **Khả năng kiểm thử:** có unit test cho validator, integration test health endpoint và danh sách test case thủ công.
- **Giới hạn hiệu năng:** prototype giới hạn danh sách API tối đa 100–500 bản ghi; hệ thống thật cần bổ sung phân trang, chỉ mục phù hợp và giám sát.

## 5. Ma trận phân quyền

| Chức năng | Khách | Học viên | Giảng viên | Quản trị viên |
|---|---:|---:|---:|---:|
| Xem khóa học đang mở | Có | Có | Có | Có |
| Tạo tài khoản học viên | Có | Không cần | Không cần | Không cần |
| Đăng ký khóa học | Không | Có | Không | Không |
| Xem hồ sơ cá nhân | Không | Có | Không áp dụng | Không áp dụng |
| Tạo/cập nhật khóa học | Không | Không | Có, theo phạm vi phụ trách | Có |
| Xóa khóa học | Không | Không | Không | Có |
| Quản lý vai trò người dùng | Không | Không | Không | Có |
| Thêm bài học / lịch | Không | Không | Có, khóa được phân công | Có |
| Cập nhật trạng thái hồ sơ | Không | Không | Có, hồ sơ khóa được phân công | Có |
| Ghi nhận kết quả đánh giá | Không | Không | Có, khóa được phân công | Có |
| Xem kết quả cá nhân | Không | Có | Không áp dụng | Không áp dụng |

## 6. Quy tắc nghiệp vụ chính

1. Đăng ký tài khoản công khai luôn tạo role `student`; không nhận role tùy ý từ client.
2. Chỉ khóa `published` xuất hiện trong danh mục public và có thể nhận đăng ký.
3. Mỗi cặp `student + course` chỉ có một hồ sơ Enrollment. Hồ sơ bị hủy chỉ được đăng ký lại nếu khóa còn `published` và còn chỉ tiêu.
4. Trạng thái Enrollment dùng trong prototype: `pending`, `approved`, `in-progress`, `completed`, `cancelled`.
5. Giảng viên chỉ được quản lý khóa học được phân công. Quản trị viên có quyền quản lý rộng hơn.
6. Bài học thuộc một khóa; lịch có thời điểm bắt đầu/kết thúc, vị trí, giảng viên và `lessonId` tùy chọn; bài được gán phải thuộc đúng khóa.
7. `ENROLLMENTS` ghi nhận số giờ lý thuyết, giờ thực hành và km thực hành đã hoàn thành; các trường này hỗ trợ demo theo dõi tiến độ nhưng không tự xác nhận điều kiện pháp lý.
8. `TheoryExamStrategy` dùng ngưỡng minh họa 50/100 và `PracticeExamStrategy` dùng 70/100; đây là quy tắc demo, không phải chuẩn thi sát hạch chính thức.

## 7. Lược đồ dữ liệu và quan hệ

ERD ở `diagrams/erd.mmd` là sơ đồ dữ liệu chính. Quan hệ quan trọng nhất là `USERS ↔ COURSES` thông qua `ENROLLMENTS`: đây là quan hệ nhiều-nhiều được chuẩn hóa bằng thực thể trung gian để lưu thời điểm, trạng thái, ghi chú và tiến độ thực hành. Một khóa có nhiều bài học, lịch và kết quả đánh giá; `SCHEDULES.lessonId` là FK tùy chọn.

## 8. Cách triển khai thiết kế

- **Model:** các schema Mongoose trong `backend/src/models/` mô tả dữ liệu và ràng buộc cơ bản.
- **Controller-like route handlers:** file trong `backend/src/routes/` nhận request, kiểm tra quyền và điều phối model.
- **Middleware Chain:** `app.js` và các middleware nối tiếp bảo mật/body parser, JWT, role authorization, input validation và route handler; lỗi được chuyển tới middleware xử lý lỗi tập trung.
- **Design Patterns:** Prototype (`patterns/coursePrototype.js`), State (`patterns/enrollmentState.js`), Strategy (`patterns/examScoringStrategy.js`) và Singleton module (`config/db.js`) được gọi trong luồng API; `validateEnrollmentRequest` minh họa một mắt xích của Chain of Responsibility.
- **Frontend:** `AuthContext` quản lý phiên người dùng; `api.js` gom cấu hình Axios; các trang dùng component tái sử dụng `Navbar` và `CourseCard`.
- **Tester:** `backend/tests/` có kiểm tra tự động; `test-plan.md` mô tả kiểm thử API/UI cần chạy trên môi trường có dependencies và MongoDB.

## 9. Đầu ra nên trình bày khi bảo vệ

1. Giới thiệu vấn đề và mục tiêu hệ thống.
2. Use Case Diagram để giải thích actor và chức năng.
3. ERD để giải thích các collection và ràng buộc quan hệ.
4. Class Diagram và Component Architecture để giải thích cấu trúc phần mềm.
5. Sequence/Activity Diagram để trình bày luồng đăng ký; State Diagram để trình bày vòng đời hồ sơ.
6. Minh họa Prototype: quản trị viên gọi `POST /api/courses/:id/clone`, hệ thống sao chép Course + Lessons thành bản nháp.
7. Minh họa State: thử một chuyển trạng thái hợp lệ và một chuyển không hợp lệ; demo điều kiện đăng ký lại khi khóa hết chỉ tiêu.
8. Minh họa Strategy: ghi kết quả lý thuyết/thực hành, cho thấy `passingScore`, `scoringStrategy` và `passed` do Backend tính.
9. Kết quả Tester: số test chạy thật, pass/fail, lỗi tìm được và hướng phát triển.
