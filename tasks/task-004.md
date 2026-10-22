# TASK SPECIFICATION: TASK-004

## 1. Tên nhiệm vụ
Xây dựng REST API Controller & Router cho các Use Case Xác thực (Authentication HTTP Endpoints) theo quy chuẩn Clean Architecture và TDD.

---

## 2. Mục tiêu kỹ thuật
- Tích hợp Express.js ở tầng Presentation/Infrastructure để tiếp nhận các HTTP requests.
- Cài đặt `AuthController` đóng vai trò là Adapter nhận request HTTP, chuyển đổi dữ liệu thành các DTO và gọi các Use Case tương ứng:
  - `POST /api/v1/auth/register` -> `RegisterUseCase`
  - `POST /api/v1/auth/login` -> `LoginUseCase`
  - `POST /api/v1/auth/refresh-token` -> `RefreshTokenUseCase`
- Áp dụng Middleware xử lý lỗi tập trung (Global Error Handler) để chuyển đổi các ngoại lệ tầng Domain/Application (`InvalidInputException`, `EmailAlreadyInUseException`, `InvalidTokenException`, `UserNotFoundException`) thành mã HTTP Status Code chuẩn (400, 401, 404, 409, 500).
- Viết Integration Tests kiểm thử toàn bộ luồng HTTP với `supertest`.

---

## 3. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] `POST /api/v1/auth/register`:
  - Trả về HTTP `201 Created` kèm thông tin User (id, email, role, createdAt) khi dữ liệu hợp lệ.
  - Trả về HTTP `400 Bad Request` khi dữ liệu đầu vào không hợp lệ (sai email, mật khẩu ngắn).
  - Trả về HTTP `409 Conflict` khi email đã tồn tại (`EmailAlreadyInUseException`).
- [ ] `POST /api/v1/auth/login`:
  - Trả về HTTP `200 OK` kèm accessToken, tokenType và expiresIn khi đăng nhập đúng.
  - Trả về HTTP `401 Unauthorized` khi sai mật khẩu hoặc tài khoản không tồn tại.
- [ ] `POST /api/v1/auth/refresh-token`:
  - Trả về HTTP `200 OK` kèm accessToken mới khi refreshToken hợp lệ.
  - Trả về HTTP `401 Unauthorized` khi refreshToken sai chữ ký hoặc hết hạn.
- [ ] Global Error Handler Middleware xử lý ngoại lệ tập trung, che giấu stack trace ở môi trường production.
- [ ] Line coverage cho tầng Controller & Route đạt tối thiểu $\ge 80\%$.
- [ ] Tách biệt hoàn toàn giữa cấu hình Express App (`app.ts`) và tệp khởi động máy chủ (`index.ts`).

---

## 4. Phạm vi tệp tin dự kiến
```text
├── tasks/
│   └── task-004.md                                      # Đặc tả kỹ thuật
├── src/
│   ├── infrastructure/
│   │   └── http/
│   │       ├── controllers/
│   │       │   └── auth.controller.ts                   # Controller điều phối Use Cases
│   │       ├── middlewares/
│   │       │   └── error-handler.middleware.ts          # Middleware bắt lỗi tập trung
│   │       ├── routes/
│   │       │   └── auth.routes.ts                       # Định nghĩa router Express
│   │       └── app.ts                                   # Cấu hình Express App
│   └── index.ts                                         # Khởi động HTTP Server (app.listen)
└── tests/
    └── integration/
        └── auth.routes.test.ts                          # Bộ kiểm thử tích hợp (Supertest)