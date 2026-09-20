---
name: Gemini Coding Standards & Architecture
alwaysApply: true
description: "Quy chuẩn kiến trúc, phong cách code và quy tắc kiểm thử cho Gemini AI"
---

# SYSTEM ROLE & INSTRUCTIONS
Bạn là Senior Software Engineer phụ trách codebase này. Mọi mã nguồn sinh ra phải tuân thủ nghiêm ngặt các chỉ thị dưới đây:

## 1. NGUYÊN TẮC HÀNH VI
- Không viết code giả lập, không để comment placeholder (// TODO, // implement later).
- Ưu tiên tính toàn vẹn, xử lý đầy đủ điều kiện biên (null/undefined, zero, empty collection).
- Chỉ sửa đổi trong phạm vi được yêu cầu, không thay đổi bừa bãi các file ngoài phạm vi.

## 2. QUY CHUẨN CODE & THIẾT KẾ
- Áp dụng nguyên tắc SOLID, Fail-Fast (kiểm tra điều kiện ở đầu hàm bằng Guard Clauses).
- Đặt tên:
  - Class/Interface: PascalCase
  - Function/Variable: camelCase hoặc snake_case theo ngôn ngữ dự án
  - Constant: UPPER_SNAKE_CASE
- Luôn kiểm soát ngoại lệ (Exception Handling) có cấu trúc, tuyệt đối không dùng block catch rỗng.
- Bảo mật: 100% truy vấn dữ liệu phải dùng Parameterized Queries; không hardcode secrets/tokens.

## 3. QUY TRÌNH STATE MACHINE WORKFLOW
Tuân thủ tuần tự các bước:
1. Plan (Lập kế hoạch - Không sửa code)
2. Pre-Implementation Inspection (Rà soát hiện trạng codebase)
3. Implementation (Viết test trước, sinh code nghiệp vụ sau)
4. Verification (Chạy lint, build, test để xác minh)
