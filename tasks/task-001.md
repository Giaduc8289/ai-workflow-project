# TASK SPECIFICATION: TASK-001

## 1. Thông tin chung
- **Mã công việc:** TASK-001
- **Tên tính năng:** Xây dựng module xác thực và phân quyền người dùng (User Authentication)
- **Mức độ ưu tiên:** High
- **Nhánh Git dự kiến:** `feature/task-001-user-auth`

## 2. Mục tiêu kỹ thuật
Xây dựng Use Case đăng nhập cho hệ thống:
- Tiếp nhận email và mật khẩu.
- Kiểm tra tính hợp lệ của dữ liệu đầu vào.
- Xác thực thông tin người dùng và trả về JWT token nếu thành công.
- Trả về ngoại lệ miền (Domain Exception) nếu thông tin sai lệch.

## 3. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Email phải đúng định dạng chuẩn RFC 5322; mật khẩu tối thiểu 8 ký tự.
- [ ] Báo lỗi `InvalidCredentialsException` khi sai tài khoản/mật khẩu (không phân biệt sai email hay sai mật khẩu để bảo mật).
- [ ] Sinh access token chứa `userId`, `role` với thời gian sống (TTL) là 1 giờ.
- [ ] Đạt line coverage >= 80% cho Use Case và Entity liên quan.
- [ ] Tuyệt đối không lưu mật khẩu dạng plain-text (sử dụng hashing salt).

## 4. Phạm vi tệp tin dự kiến
- `src/domain/entities/user.entity.ts`
- `src/domain/exceptions/auth.exception.ts`
- `src/application/use-cases/login.use-case.ts`
- `tests/unit/login.use-case.test.ts`
