import { RegisterUseCase, RegisterDTO } from '../../src/application/use-cases/register.use-case';
import { IUserRepository } from '../../src/domain/repositories/user-repository.interface';
import { IPasswordHasher } from '../../src/application/ports/password-hasher.interface';
import { IIdGenerator } from '../../src/application/ports/id-generator.interface';
import { EmailAlreadyInUseException, InvalidInputException } from '../../src/domain/exceptions/auth.exception';
import { User } from '../../src/domain/entities/user.entity';

describe('RegisterUseCase', () => {
  let userRepositoryMock: jest.Mocked<IUserRepository>;
  let passwordHasherMock: jest.Mocked<IPasswordHasher>;
  let idGeneratorMock: jest.Mocked<IIdGenerator>;
  let registerUseCase: RegisterUseCase;

  beforeEach(() => {
    userRepositoryMock = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    passwordHasherMock = {
      hash: jest.fn().mockResolvedValue('hashed_password_sample'),
      verify: jest.fn(),
      generateSalt: jest.fn().mockResolvedValue('random_salt_123'),
    };

    idGeneratorMock = {
      generate: jest.fn().mockReturnValue('generated-uuid-1234'),
    };

    registerUseCase = new RegisterUseCase(
      userRepositoryMock,
      passwordHasherMock,
      idGeneratorMock
    );
  });

  it('nên ném lỗi InvalidInputException nếu định dạng email không hợp lệ theo RFC 5322', async () => {
    const invalidDto: RegisterDTO = {
      email: 'invalid-email-format',
      password: 'SecurePassword123!',
    };

    await expect(registerUseCase.execute(invalidDto)).rejects.toThrow(InvalidInputException);
    expect(userRepositoryMock.findByEmail).not.toHaveBeenCalled();
    expect(userRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('nên ném lỗi InvalidInputException nếu mật khẩu ngắn hơn 8 ký tự', async () => {
    const shortPasswordDto: RegisterDTO = {
      email: 'valid.user@example.com',
      password: '123',
    };

    await expect(registerUseCase.execute(shortPasswordDto)).rejects.toThrow(InvalidInputException);
    expect(userRepositoryMock.findByEmail).not.toHaveBeenCalled();
    expect(userRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('nên ném lỗi EmailAlreadyInUseException nếu email đã tồn tại trong hệ thống', async () => {
    const existingEmail = 'existing.user@example.com';
    const existingUser = new User({
      id: 'existing-id',
      email: existingEmail,
      passwordHash: 'hash',
      salt: 'salt',
      role: 'MEMBER',
    });

    userRepositoryMock.findByEmail.mockResolvedValue(existingUser);

    const dto: RegisterDTO = {
      email: existingEmail,
      password: 'ValidPassword123!',
    };

    await expect(registerUseCase.execute(dto)).rejects.toThrow(EmailAlreadyInUseException);
    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(existingEmail);
    expect(userRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('nên đăng ký thành công với role mặc định là MEMBER khi không truyền role', async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    const dto: RegisterDTO = {
      email: 'new.member@example.com',
      password: 'SecurePassword123!',
    };

    const result = await registerUseCase.execute(dto);

    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith('new.member@example.com');
    expect(passwordHasherMock.hash).toHaveBeenCalledWith('SecurePassword123!', 'random_salt_123');
    expect(idGeneratorMock.generate).toHaveBeenCalled();
    expect(userRepositoryMock.save).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      id: 'generated-uuid-1234',
      email: 'new.member@example.com',
      role: 'MEMBER',
      createdAt: expect.any(Date),
    });
  });

  it('nên đăng ký thành công với role chỉ định (ADMIN)', async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    const dto: RegisterDTO = {
      email: 'admin.user@example.com',
      password: 'AdminPassword123!',
      role: 'ADMIN',
    };

    const result = await registerUseCase.execute(dto);

    expect(result.role).toBe('ADMIN');
    const savedUser = userRepositoryMock.save.mock.calls[0][0];
    expect(savedUser.role).toBe('ADMIN');
  });
});