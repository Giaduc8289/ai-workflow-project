import { User } from './domain/entities/user.entity';
import { IUserRepository } from './domain/repositories/user-repository.interface';
import { IPasswordHasher } from './application/ports/password-hasher.interface';
import { ITokenService, TokenPayload } from './application/ports/token-service.interface';
import { IIdGenerator } from './application/ports/id-generator.interface';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import * as crypto from 'crypto';

// 1. Adapter lưu trữ User trong bộ nhớ (In-Memory Repository)
class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async findByEmail(email: string): Promise<User | null> {
    const user = Array.from(this.users.values()).find((u) => u.email === email.toLowerCase().trim());
    return user || null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }
}

// 2. Adapter băm mật khẩu bằng module crypto có sẵn của Node.js
class CryptoPasswordHasher implements IPasswordHasher {
  async generateSalt(): Promise<string> {
    return crypto.randomBytes(16).toString('hex');
  }

  async hash(password: string, salt: string): Promise<string> {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  }

  async verify(password: string, hash: string, salt: string): Promise<boolean> {
    const computedHash = await this.hash(password, salt);
    return computedHash === hash;
  }
}

// 3. Adapter sinh ID ngẫu nhiên
class CryptoIdGenerator implements IIdGenerator {
  generate(): string {
    return crypto.randomUUID();
  }
}

// 4. Adapter tạo chuỗi Access Token giả lập
class SimpleTokenService implements ITokenService {
  generateToken(payload: TokenPayload, expiresInSeconds: number): string {
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
  const registerUseCase = new RegisterUseCase(userRepository, passwordHasher, idGenerator);
  const loginUseCase = new LoginUseCase(userRepository, passwordHasher, tokenService);

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
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
    console.error('-> Đăng nhập thất bại:', error.message);
  }

  console.log('\n==============================================');
  console.log('--- TOÀN BỘ LUỒNG CHẠY HOÀN HẢO ---');
  console.log('==============================================');
}

main().catch(console.error);