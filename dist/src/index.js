"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const register_use_case_1 = require("./application/use-cases/register.use-case");
const login_use_case_1 = require("./application/use-cases/login.use-case");
const crypto = __importStar(require("crypto"));
// 1. Adapter lưu trữ User trong bộ nhớ (In-Memory Repository)
class InMemoryUserRepository {
    users = new Map();
    async findByEmail(email) {
        const user = Array.from(this.users.values()).find((u) => u.email === email.toLowerCase().trim());
        return user || null;
    }
    async save(user) {
        this.users.set(user.id, user);
    }
}
// 2. Adapter băm mật khẩu bằng module crypto có sẵn của Node.js
class CryptoPasswordHasher {
    async generateSalt() {
        return crypto.randomBytes(16).toString('hex');
    }
    async hash(password, salt) {
        return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    }
    async verify(password, hash, salt) {
        const computedHash = await this.hash(password, salt);
        return computedHash === hash;
    }
}
// 3. Adapter sinh ID ngẫu nhiên
class CryptoIdGenerator {
    generate() {
        return crypto.randomUUID();
    }
}
// 4. Adapter tạo chuỗi Access Token giả lập
class SimpleTokenService {
    generateToken(payload, expiresInSeconds) {
        const rawData = JSON.stringify({ ...payload, exp: Date.now() + expiresInSeconds * 1000 });
        return Buffer.from(rawData).toString('base64url');
    }
}
// 5. Hàm chạy thực tế luồng Register -> Login
async function main() {
    console.log('==============================================');
    console.log('--- KHỞI CHẠY KIỂM TRA LUỒNG AUTH DỰ ÁN ---');
    console.log('==============================================\n');
    // Khởi tạo các adapter hạ tầng
    const userRepository = new InMemoryUserRepository();
    const passwordHasher = new CryptoPasswordHasher();
    const idGenerator = new CryptoIdGenerator();
    const tokenService = new SimpleTokenService();
    // Khởi tạo Use Cases
    const registerUseCase = new register_use_case_1.RegisterUseCase(userRepository, passwordHasher, idGenerator);
    const loginUseCase = new login_use_case_1.LoginUseCase(userRepository, passwordHasher, tokenService);
    const testEmail = 'hung.tran@example.com';
    const testPassword = 'SecurePassword2026!';
    // --- KỊCH BẢN 1: ĐĂNG KÝ TÀI KHOẢN MỚI ---
    console.log('[1] Thực hiện đăng ký người dùng mới...');
    try {
        const registerResult = await registerUseCase.execute({
            email: testEmail,
            password: testPassword,
            role: 'ADMIN',
        });
        console.log('-> ĐĂNG KÝ THÀNH CÔNG:');
        console.log('   User ID   :', registerResult.id);
        console.log('   Email     :', registerResult.email);
        console.log('   Role      :', registerResult.role);
        console.log('   CreatedAt :', registerResult.createdAt);
    }
    catch (error) {
        console.error('-> Đăng ký thất bại:', error.message);
    }
    // --- KỊCH BẢN 2: THỬ ĐĂNG KÝ TRÙNG EMAIL ---
    console.log('\n[2] Kiểm tra ném lỗi khi đăng ký trùng email...');
    try {
        await registerUseCase.execute({
            email: testEmail,
            password: 'AnotherPassword123!',
        });
        console.log('-> Lỗi logic: Hệ thống vẫn cho phép trùng email!');
    }
    catch (error) {
        console.log('-> ĐÃ CHẶN THÀNH CÔNG:', error.name, '-', error.message);
    }
    // --- KỊCH BẢN 3: ĐĂNG NHẬP SAI MẬT KHẨU ---
    console.log('\n[3] Thử đăng nhập với mật khẩu sai...');
    try {
        await loginUseCase.execute({
            email: testEmail,
            password: 'WrongPassword123!',
        });
        console.log('-> Lỗi: Mật khẩu sai nhưng vẫn đăng nhập được!');
    }
    catch (error) {
        console.log('-> ĐÃ TỪ CHỐI THÀNH CÔNG:', error.name, '-', error.message);
    }
    // --- KỊCH BẢN 4: ĐĂNG NHẬP ĐÚNG THÔNG TIN ---
    console.log('\n[4] Thực hiện đăng nhập với thông tin chính xác...');
    try {
        const loginResult = await loginUseCase.execute({
            email: testEmail,
            password: testPassword,
        });
        console.log('-> ĐĂNG NHẬP THÀNH CÔNG:');
        console.log('   Access Token :', loginResult.accessToken);
        console.log('   Token Type   :', loginResult.tokenType);
        console.log('   Expires In   :', loginResult.expiresIn, 'giây');
    }
    catch (error) {
        console.error('-> Đăng nhập thất bại:', error.message);
    }
    console.log('\n==============================================');
    console.log('--- TOÀN BỘ LUỒNG CHẠY HOÀN HẢO ---');
    console.log('==============================================');
}
main().catch(console.error);
