# TASK SPECIFICATION: TASK-002

## 1. Tên nhiệm vụ
Phát triển tính năng Đăng ký người dùng (User Registration Use Case) theo quy chuẩn TDD và Clean Architecture.

---

## 2. Mục tiêu kỹ thuật
- Tiếp nhận `email`, `password` và `role` (mặc định là `MEMBER` nếu không chỉ định).
- Kiểm tra tính hợp lệ của dữ liệu đầu vào (áp dụng Fail-Fast với Guard Clauses).
- Kiểm tra trùng lặp email thông qua `IUserRepository`.
- Sinh Salt ngẫu nhiên và băm mật khẩu (Hashing + Salt) bằng `IPasswordHasher`.
- Tạo mới `User` Entity và lưu vào cơ sở dữ liệu qua `IUserRepository.save()`.
- Trả về thông tin User vừa tạo (ẩn trường mật khẩu và salt).

---

## 3. Tiêu chí nghiệm thu (Acceptance Criteria)
- [x] Email phải đúng định dạng chuẩn RFC 5322; Mật khẩu tối thiểu 8 ký tự.
- [x] Báo lỗi `EmailAlreadyInUseException` khi email đã tồn tại trong hệ thống.
- [x] Mật khẩu được sinh salt và hash an toàn trước khi lưu vào User Entity.
- [x] Phương thức `save(user: User): Promise<void>` được bổ sung vào `IUserRepository`.
- [x] Đạt line coverage >= 80% cho RegisterUseCase và các thành phần liên quan.
- [x] Tuân thủ tuyệt đối quy chuẩn Clean Architecture và gemini-rules.md (100% không TODO/placeholder).

---

## 4. Phạm vi tệp tin
- `src/domain/exceptions/auth.exception.ts` (Bổ sung `EmailAlreadyInUseException`)
- `src/domain/repositories/user-repository.interface.ts` (Bổ sung phương thức `save`)
- `src/application/ports/password-hasher.interface.ts` (Bổ sung phương thức `generateSalt`)
- `src/application/ports/id-generator.interface.ts` (Interface sinh định danh UUID)
- `src/application/use-cases/register.use-case.ts` (Mã nguồn nghiệp vụ đăng ký)
- `tests/unit/register.use-case.test.ts` (Bộ kiểm thử đơn vị TDD)
- `src/index.ts` (Entry Point kiểm tra luồng thực tế)