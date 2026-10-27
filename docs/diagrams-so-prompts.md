# 7 prompt tạo sơ đồ DriveWise trên Diagrams.so — bản đồng bộ với source code

## Cách dùng

Mở https://diagrams.so/create, dán từng prompt bên dưới vào ô mô tả, tạo một sơ đồ tại một thời điểm rồi tự rà soát kết quả. Diagrams.so tạo sơ đồ từ ngôn ngữ tự nhiên; các file Mermaid ở `docs/diagrams/` là bản nguồn độc lập dùng trong Mermaid editor. Không dán cú pháp `.mmd` vào Diagrams.so.

Tất cả sơ đồ cần dùng nhãn hiển thị tiếng Việt, bố cục ngang/rộng khi phù hợp, đường nối không chồng chữ, không thêm chức năng ngoài phạm vi. Tên field, class, API và trạng thái có thể giữ tiếng Anh để nhất quán với code. Khi xuất báo cáo, ưu tiên SVG/PNG độ phân giải cao và kiểm tra lại nội dung trước khi nộp.

---

## 01. Use Case Diagram — Sơ đồ ca sử dụng

```text
Create a proper UML Use Case Diagram for “DriveWise – Hệ thống đào tạo lái xe”. Use a single system boundary, stick-figure actors outside, oval use cases inside, straight association lines, a clean white landscape canvas, and readable Vietnamese labels. Do not create a flowchart or database diagram.

Actors: “Khách truy cập”, “Học viên”, “Giảng viên”, “Quản trị viên”.

Use cases inside the system boundary:
- “Xem danh mục khóa học”
- “Tìm kiếm và lọc khóa học”
- “Đăng ký tài khoản”
- “Đăng nhập / Đăng xuất”
- “Gửi đăng ký khóa học”
- “Theo dõi hồ sơ đăng ký”
- “Xem lịch học”
- “Xem kết quả đánh giá”
- “Quản lý khóa học”
- “Nhân bản khóa học mẫu”
- “Quản lý bài học”
- “Tạo lịch đào tạo”
- “Duyệt / cập nhật hồ sơ đăng ký”
- “Ghi nhận kết quả thi”
- “Quản lý người dùng và phân quyền”

Associations:
- Khách truy cập: view catalog, search/filter, register account, login/logout.
- Học viên: view catalog, search/filter, login/logout, send enrollment, track own enrollment, view own schedules/results.
- Giảng viên: login/logout, manage assigned courses, manage lessons, create schedules, update enrollment status for assigned courses, record assessment results for assigned courses.
- Quản trị viên: login/logout, manage courses, clone course template, manage lessons, create schedules, update enrollment status, record results, manage users and roles.

Keep the four actors on the left and group use cases on the right by public/account, student, and staff responsibilities. Prevent actor lines from passing through other use-case ovals. Do not show payment, certificate issuance, GPS vehicle tracking, or an external exam gateway. If an authentication dependency is shown, label it clearly and use a dashed UML dependency arrow starting from “Gửi đăng ký khóa học” toward a dedicated “Xác thực phiên học viên” use case; do not make “Đăng nhập / Đăng xuất” a compulsory include for every action.
```

**Giải thích:** Use Case trả lời hai câu hỏi: ai dùng hệ thống và họ được phép thực hiện chức năng nào. Đây là góc nhìn nghiệp vụ, không thể hiện thứ tự xử lý API.

---

## 02. ERD — Sơ đồ thực thể và quan hệ

```text
Create a logical ERD for the MongoDB-backed DriveWise driving-school website. Use crow’s-foot cardinalities and show PK, UK, and FK/ObjectId reference fields. Use Vietnamese entity subtitles but keep collection and field names exactly. This is a logical relationship model; do not claim MongoDB physically stores SQL tables.

USERS — Tài khoản: _id PK, fullName, email UK, password (bcrypt hash; never display plaintext), phone, role(student/instructor/admin), createdAt, updatedAt.

COURSES — Khóa học: _id PK, code UK, title, category(A1/A/B/C1/C/D1/Khác), type(Lý thuyết/Thực hành/Tổng hợp), description, durationWeeks, tuition, seatLimit, imageUrl, learningOutcomes(array), instructor FK -> USERS._id nullable, status(draft/published/archived), createdAt, updatedAt.

ENROLLMENTS — Hồ sơ đăng ký: _id PK, student FK -> USERS._id, course FK -> COURSES._id, enrolledAt, status(pending/approved/in-progress/completed/cancelled), note, theoryHoursCompleted, practiceHoursCompleted, practiceKmCompleted, createdAt, updatedAt. Add a unique compound constraint on (student, course).

LESSONS — Bài học: _id PK, course FK -> COURSES._id, title, summary, lessonType(theory/practice), order, videoUrl, materialsUrl. Add unique compound constraint on (course, order).

SCHEDULES — Lịch đào tạo: _id PK, course FK -> COURSES._id, lessonId FK -> LESSONS._id nullable, instructor FK -> USERS._id, student FK -> USERS._id nullable for a group session, startsAt, endsAt, location, sessionType(theory/practice/exam), status(scheduled/completed/cancelled).

EXAM_RESULTS — Kết quả đánh giá: _id PK, student FK -> USERS._id, course FK -> COURSES._id, assessedBy FK -> USERS._id, examType(theory/practice), score(0–100), passingScore, scoringStrategy, passed(boolean), feedback, takenAt, createdAt, updatedAt.

Relationships: USERS 1 to many ENROLLMENTS as student; COURSES 1 to many ENROLLMENTS; COURSES 1 to many LESSONS; COURSES 1 to many SCHEDULES; LESSONS zero-or-one per SCHEDULE via nullable lessonId; USERS 1 to many SCHEDULES as instructor; USERS zero-or-one student reference per group SCHEDULE; USERS 1 to many EXAM_RESULTS as student and separately as assessor; COURSES 1 to many EXAM_RESULTS; USERS 0-or-1 instructor reference for many COURSES.

Use a spacious layout with ENROLLMENTS centered between USERS and COURSES. Separate the multiple roles of USERS using clearly labeled relationships: student, instructor, assessedBy. Draw schedule.lessonId as optional, not mandatory. Do not add PAYMENTS, VEHICLES, CERTIFICATES, or DRIVING_LOG collections because they are not implemented in this MVP.
```

**Giải thích:** ERD thể hiện sáu collection và các tham chiếu ObjectId. `ENROLLMENTS` giải quyết quan hệ nhiều-nhiều giữa học viên và khóa học; `lessonId` giúp biết buổi học gắn với bài nào; các trường giờ/km phục vụ theo dõi tiến độ minh họa.

---

## 03. Class Diagram — Sơ đồ lớp và Design Patterns

```text
Create a UML Class Diagram for DriveWise that is strictly consistent with an Express/Mongoose codebase. Use class rectangles with class names, selected attributes and operations. Use Vietnamese explanatory notes; keep exact English identifiers for source-code modules and methods. Show correct inheritance arrows and dashed dependency arrows. Avoid line crossings, overlapping multiplicities and SQL-table styling.

Domain classes:
- User: id:ObjectId, fullName:String, email:String, role:Role; register(), login().
- Course: id:ObjectId, code:String, title:String, category:String, status:String; publish(), updateDetails().
- Enrollment: id:ObjectId, student:ObjectId, course:ObjectId, status:EnrollmentStatus, theoryHoursCompleted:Number, practiceHoursCompleted:Number, practiceKmCompleted:Number.
- Lesson: id:ObjectId, course:ObjectId, title:String, lessonType:String, order:Number.
- Schedule: id:ObjectId, course:ObjectId, lessonId:ObjectId nullable, instructor:ObjectId, student:ObjectId nullable, startsAt:Date, endsAt:Date, status:String.
- ExamResult: id:ObjectId, student:ObjectId, course:ObjectId, examType:String, score:Number, passed:Boolean, passingScore:Number, scoringStrategy:String.

Route modules (modules xử lý HTTP, not database entities): AuthRoutes, UserRoutes, CourseRoutes, EnrollmentRoutes, LessonRoutes, ScheduleRoutes, ExamResultRoutes. Show CourseRoutes -> Course and CoursePrototype; EnrollmentRoutes -> Enrollment and EnrollmentState; ExamResultRoutes -> ExamScoringStrategy; AuthRoutes/UserRoutes -> User; LessonRoutes -> Lesson; ScheduleRoutes -> Schedule.

Prototype Pattern: class CoursePrototype with buildCoursePrototype(source, overrides) and buildLessonPrototypes(lessons, targetCourseId). Add note “Nhân bản Course + Lessons thành draft; không nhân bản lịch thực tế, hồ sơ học viên hoặc kết quả thi”. CoursePrototype depends on Course and Lesson.

State Pattern: base class EnrollmentState with transitionTo(next, context); concrete classes PendingState, ApprovedState, InProgressState, CompletedState, CancelledState inherit from EnrollmentState. EnrollmentRoutes depends on EnrollmentState/transitionEnrollment. Add guard note: cancelled -> pending only when the course is published and has available seats. Do not allow completed -> cancelled.

Strategy Pattern: base class ExamScoringStrategy with evaluate(score); concrete TheoryExamStrategy (demo passingScore 50/100) and PracticeExamStrategy (demo passingScore 70/100) inherit from it. ExamResultRoutes selects the strategy based on examType. Add note that both thresholds are educational demo values, not official Vietnamese driving-test rules.

Chain of Responsibility: depict SecurityMiddleware, AuthMiddleware, RoleAuthorization, EnrollmentInputValidation and EnrollmentRoutes/handler in request order with dashed dependencies or an ordered pipeline note. Show next(req,res,next) as middleware continuation.

Singleton: MongoConnection module has a cached connectionPromise and connectDB(); add stereotype “Singleton via Node.js module” and show the server reuses this shared Mongoose connection.

Domain associations: User 0..1 instructor -> 0..* Course; User 1 -> 0..* Enrollment; Course 1 -> 0..* Enrollment; Course composition 1 -> 0..* Lesson; Course 1 -> 0..* Schedule; Lesson 0..1 -> 0..* Schedule via lessonId; User as instructor 1 -> 0..* Schedule; optional student per Schedule; User as student 1 -> 0..* ExamResult; Course 1 -> 0..* ExamResult; User as assessor 1 -> 0..* ExamResult.

Arrange domain classes centrally and design-pattern classes in a separate lower/right area with enough spacing. Do not include unrelated Prototype examples like exam clones, contract prototypes, or SQL tables. Every pattern shown must correspond to the named code modules above.
```

**Giải thích:** Đây là sơ đồ quan trọng nhất với môn Mẫu thiết kế phần mềm. Nó phải thể hiện cả các lớp nghiệp vụ lẫn cách Prototype, State, Strategy, Chain of Responsibility và Singleton được dùng trong mã nguồn thật.

---

## 04. Sequence Diagram — Luồng đăng ký khóa học

```text
Create a UML Sequence Diagram for “Học viên đăng ký khóa học” in DriveWise. Lifelines left-to-right: Học viên, React Frontend, Express REST API, JWT Auth Middleware, Role Authorization, Input Validation, MongoDB. Use actual UML combined fragments labelled alt/else, not sequentially stacked error messages.

Main path: student clicks Register; FE sends POST /api/enrollments with courseId and Bearer JWT; API invokes JWT Auth; Auth looks up user by token ID in MongoDB. Immediately after auth, show alt [token invalid or account missing] -> HTTP 401 to FE; else continue. Then Role Authorization checks student role; show alt [wrong role] -> HTTP 403; else continue. Input Validation checks presence and ObjectId format of courseId; show alt [missing/invalid courseId] -> HTTP 400; else continue to handler.

Handler queries Course. Show alt [course missing or status != published] -> HTTP 404; else query active enrollment count and existing student-course record. Show alt [seat limit reached or non-cancelled duplicate exists] -> HTTP 409; else create Enrollment status pending (or re-activate a cancelled record only if course remains published and a seat is available), MongoDB returns saved document, API returns HTTP 201 and FE shows success.

Each error path returns a single appropriate HTTP response and a Vietnamese message. Do not run DB queries before authentication succeeds. Do not draw any Frontend-to-MongoDB connection. Use one outer alt for authentication/authorization and nested alt fragments for validation and business rules; do not place all errors one after another in a single unbranched sequence.
```

**Giải thích:** Sequence phải làm rõ nhánh thay thế. HTTP 401/403 xuất hiện ở middleware trước truy vấn khóa học; 404 và 409 chỉ xảy ra sau khi token và quyền đã hợp lệ.

---

## 05. Activity Diagram — Quy trình nghiệp vụ đăng ký

```text
Create a UML Activity Diagram for the DriveWise enrollment process using swimlanes for “Học viên”, “Backend”, and “Trung tâm đào tạo”. Use proper initial/final nodes, rounded actions, diamond decisions, and labeled Yes/No edges. Vietnamese labels only except API/status identifiers.

Student lane: open catalog -> choose course -> decision logged in? If no, login/register and validate credentials; retry on invalid credentials. If yes, click register.
Backend lane: validate JWT and role; validate courseId; check that the course is published; check capacity and duplicate enrollment. Use labeled error actions for 401/403, 400, 404 and 409, each ending that request. If valid, create or re-activate Enrollment as pending and return HTTP 201.

Important asynchronous handoff: after “Hiển thị đăng ký thành công” put a note “Yêu cầu đã kết thúc; việc duyệt được thực hiện sau đó”. Use a dashed signal/event connector or an explicit handoff to the “Trung tâm đào tạo” lane; do not imply the administrator approves inside the same synchronous HTTP request.

Training-center lane: later review pending applications; decision “Duyệt hồ sơ?”. Yes -> set approved. No -> set cancelled. Do not create a state named rejected or “yêu cầu bổ sung thông tin” unless a real status for it is included in the implementation. From approved, the later training lifecycle proceeds to in-progress then completed; cancellation is allowed according to the State Diagram.

Use a wide, clear layout. Do not connect “request information” straight to final while omitting student resubmission. Do not invent a payment step.
```

**Giải thích:** Activity Diagram mô tả quy trình và điểm quyết định. Tách swimlane và mốc bất đồng bộ giúp tránh hiểu nhầm trung tâm duyệt ngay trong cùng yêu cầu đăng ký.

---

## 06. Component / Architecture Diagram — Kiến trúc và middleware chain

```text
Create a UML Component / Layered Architecture Diagram for DriveWise. Use neat component rectangles or UML package notation on a white landscape canvas. Do not use flowchart diamonds for components. Keep request and response lines parallel and label them separately so no text overlaps.

Client layer: React Pages & Components; AuthContext; centralized Axios API Client.
Application layer: Express REST API; global middleware Helmet; CORS; JSON body parser; route modules AuthRoutes, UserRoutes, CourseRoutes, EnrollmentRoutes, LessonRoutes, ScheduleRoutes, ExamResultRoutes; Mongoose models; central error handler.
Database layer: MongoDB collections USERS, COURSES, ENROLLMENTS, LESSONS, SCHEDULES, EXAM_RESULTS.

Show request path in order: Browser -> Axios API Client -> Helmet/CORS/body parser -> JWT Authentication (when endpoint is protected) -> Role Authorization -> Input Validation -> route/business handler -> Mongoose model -> MongoDB. Add note “Express middleware calls next() to pass control or stops with an error response”. Do not imply every public request must have a valid JWT: public catalog and health endpoint are exceptions.

Show solid arrow “Request: HTTPS/HTTP + JSON + Bearer JWT” from client to API; show a separate parallel dashed arrow “Response: JSON status + data/message” from API to client. Keep both labels separate, never concatenate or overlap them.

Show Design Patterns beside the business layer: Prototype course clone; State enrollment lifecycle; Strategy theory/practice scoring; Singleton cached MongoDB connection. Frontend must never connect directly to MongoDB. Use rectangular components for validation and business logic, not diamond decision symbols.
```

**Giải thích:** Architecture phân tầng và xác định nơi mỗi mẫu thiết kế thực thi. Chuỗi middleware là thứ tự xử lý request thực tế của Express, không phải một chuỗi hình thoi của flowchart.

---

## 07. State Diagram — Vòng đời hồ sơ đăng ký

```text
Create a UML State Machine Diagram for Enrollment in DriveWise. Use only the five implementation states: pending, approved, in-progress, completed, cancelled. Keep state identifiers in English and add Vietnamese descriptions. Use directed transition arrows and readable guard conditions.

Initial -> pending: “Học viên gửi hồ sơ”.
pending -> approved: “Trung tâm duyệt”.
pending -> cancelled: “Từ chối hoặc hủy”.
approved -> in-progress: “Bắt đầu học”.
approved -> cancelled: “Hủy trước khi học”.
in-progress -> completed: “Hoàn thành khóa học”.
in-progress -> cancelled: “Dừng học”.
cancelled -> pending: “Đăng ký lại [course.status == published AND activeEnrollmentCount < seatLimit]”.
completed -> final node; no outgoing transition from completed.

Add note beside cancelled: reactivation reuses the existing (student, course) Enrollment record because a unique compound index prevents a second record for the same pair. The backend checks that the course is published and has a seat before reactivation. Do not draw cancelled -> approved directly. Do not allow completed -> cancelled. Do not introduce a separate rejected state or an unspecified “reactivated” state.
```

**Giải thích:** State Diagram cần trùng enum `Enrollment.status` trong Mongoose và transition rules trong `enrollmentState.js`. Guard condition làm rõ vì sao không thể đăng ký lại một khóa đã đóng hoặc đủ chỉ tiêu.

---

## Checklist kiểm tra trước khi nộp

- [ ] 7 sơ đồ dùng cùng tên collection, class, route và trạng thái với source code.
- [ ] Class Diagram tích hợp Prototype, State, Strategy, Chain of Responsibility và Singleton; không còn sơ đồ Prototype độc lập không liên quan tới DriveWise.
- [ ] ERD có `SCHEDULES.lessonId` nullable, tiến độ giờ/km trong `ENROLLMENTS`, và `passingScore/scoringStrategy` trong `EXAM_RESULTS`.
- [ ] State Diagram cho phép `cancelled -> pending` chỉ khi khóa đang `published` và còn chỗ.
- [ ] Sequence có khung `alt/else`, lỗi xác thực xuất hiện trước truy vấn khóa học.
- [ ] Activity tách đăng ký đồng bộ với bước trung tâm duyệt bất đồng bộ.
- [ ] Architecture dùng hình component/package cho validation, có request/response riêng và thể hiện chuỗi middleware.
- [ ] Đường nối không chồng chữ; cardinality đúng; tên nhãn tiếng Việt không bị lỗi font.
- [ ] Xuất PNG/SVG sắc nét, kiểm tra từng ảnh và đặt tên `01-use-case`, `02-erd`, `03-class-diagram`, `04-sequence-enrollment`, `05-activity-enrollment`, `06-architecture`, `07-enrollment-state`.
- [ ] Viết đoạn giải thích dưới mỗi hình và lưu cả mã Mermaid trong `docs/diagrams/` làm bản có thể chỉnh sửa.
