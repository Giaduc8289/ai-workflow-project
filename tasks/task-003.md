# TASK SPECIFICATION: TASK-003

## 1. Thông tin chung
- **Mã công việc:** TASK-003
- **Tên tính năng:** Xây dựng Use Case làm mới Access Token (Refresh Token)
- **Mức độ ưu tiên:** High
- **Nhánh Git dự kiến:** `feature/task-003-refresh-token`

## 2. Mục tiêu kỹ thuật
Xây dựng `RefreshTokenUseCase` theo quy chuẩn Clean Architecture:
- Tiếp nhận `refreshToken` qua request DTO và kiểm tra dữ liệu đầu vào theo nguyên tắc Fail-Fast.
- Kiểm tra tính hợp lệ của refresh token thông qua `ITokenService`. Token hợp lệ phải cung cấp `userId` để xác định người dùng.
- Tra cứu người dùng qua `IUserRepository`; ném `UserNotFoundException` nếu không tìm thấy người dùng.
- Sinh access token mới cho người dùng đã xác thực và trả về `TokenResponseDTO` gồm `accessToken`, `tokenType: 'Bearer'` và `expiresIn`.
- Sử dụng thời hạn access token theo quy ước của luồng đăng nhập hiện tại (3600 giây).

## 3. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Thiếu hoặc rỗng `refreshToken` bị từ chối ngay trước khi gọi các dependency.
- [ ] Refresh token không hợp lệ bị từ chối qua `ITokenService`; không tra cứu người dùng hoặc cấp token mới.
- [ ] `ITokenService` cung cấp khả năng xác thực refresh token và thông tin định danh `userId`; `IUserRepository` cung cấp khả năng tra cứu người dùng theo ID.
- [ ] Ném `UserNotFoundException` khi `userId` từ token hợp lệ không tương ứng với người dùng tồn tại.
- [ ] Chỉ cấp access token mới sau khi refresh token hợp lệ và người dùng tồn tại.
- [ ] Kết quả có kiểu `TokenResponseDTO` với đúng các trường `accessToken`, `tokenType` (literal `'Bearer'`) và `expiresIn`; thời hạn access token là 3600 giây.
- [ ] Unit test bao phủ các nhánh thành công, đầu vào không hợp lệ, refresh token không hợp lệ và không tìm thấy người dùng; line coverage của Use Case và thành phần liên quan >= 80%.
- [ ] Tuân thủ Clean Architecture: Use Case chỉ phụ thuộc vào các interface/port, không phụ thuộc trực tiếp vào adapter hoặc hạ tầng.

## 4. Phạm vi tệp tin dự kiến
- `src/application/ports/token-service.interface.ts` (Bổ sung khả năng xác thực refresh token và lấy payload)
- `src/domain/repositories/user-repository.interface.ts` (Bổ sung phương thức tra cứu người dùng theo ID)
- `src/domain/exceptions/auth.exception.ts` (Bổ sung `UserNotFoundException` nếu chưa có)
- `src/application/use-cases/refresh-token.use-case.ts` (Use Case làm mới access token và các DTO)
- `tests/unit/refresh-token.use-case.test.ts` (Unit test cho `RefreshTokenUseCase`)
