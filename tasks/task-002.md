# TASK SPECIFICATION: TASK-002

## 1. Thông tin chung
- **Mã công việc:** TASK-002
- **Tên tính năng:** Xây dựng module đăng ký tài khoản người dùng mới (User Registration)
- **Mức độ ưu tiên:** High
- **Nhánh Git dự kiến:** `feature/task-002-user-registration`

## 2. Mục tiêu kỹ thuật
Xây dựng Use Case đăng ký cho hệ thống:
- Tiếp nhận email, mật khẩu và role (mặc định là MEMBER nếu không chỉ định).
- Kiểm tra tính hợp lệ của dữ liệu đầu vào (Fail-Fast với Guard Clauses).
- Kiểm tra trùng lặp email thông qua UserRepository.
- Sinh Salt ngẫu nhiên và băm mật khẩu (Hashing + Salt) bằng `IPasswordHasher`.
- Tạo mới User Entity và lưu vào cơ sở dữ liệu qua UserRepository.
- Trả về thông tin User vừa tạo (ẩn trường mật khẩu và salt).

## 3. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Email phải đúng định dạng chuẩn RFC 5322; Mật khẩu tối thiểu 8 ký tự.
- [ ] Báo lỗi `EmailAlreadyInUseException` khi email đã tồn tại trong hệ thống.
- [ ] Mật khẩu được sinh salt và hash an toàn trước khi lưu vào User Entity.
- [ ] Phương thức `save(user: User): Promise<void>` được bổ sung vào `IUserRepository`.
- [ ] Đạt line coverage >= 80% cho RegisterUseCase và các thành phần liên quan.
- [ ] Tuân thủ tuyệt đối quy chuẩn Clean Architecture và gemini-rules.md (100% không TODO/placeholder).

## 4. Phạm vi tệp tin dự kiến
- `src/domain/exceptions/auth.exception.ts` (Bổ sung `EmailAlreadyInUseException`)
- `src/domain/repositories/user-repository.interface.ts` (Bổ sung phương thức `save`)
- `src/application/use-cases/register.use-case.ts` (Use Case đăng ký mới)
- `tests/unit/register.use-case.test.ts` (Unit test cho RegisterUseCase)