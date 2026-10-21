import { LoginUseCase } from '../../src/application/use-cases/login.use-case';
import { IPasswordHasher } from '../../src/application/ports/password-hasher.interface';
import { ITokenService } from '../../src/application/ports/token-service.interface';
import { IUserRepository } from '../../src/domain/repositories/user-repository.interface';
import { User } from '../../src/domain/entities/user.entity';
import { InvalidCredentialsException } from '../../src/domain/exceptions/auth.exception';

describe('LoginUseCase Unit Tests', () => {
  let userRepositoryMock: jest.Mocked<IUserRepository>;
  let passwordHasherMock: jest.Mocked<IPasswordHasher>;
  let tokenServiceMock: jest.Mocked<ITokenService>;
  let loginUseCase: LoginUseCase;

  const mockUser = new User({
    id: 'user-001',
    email: 'valid.user@example.com',
    passwordHash: 'hashed_secret_password',
    salt: 'salt_123',
    role: 'ADMIN',
  });

  beforeEach(() => {
    userRepositoryMock = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    passwordHasherMock = {
      hash: jest.fn(),
      verify: jest.fn(),
    };

    tokenServiceMock = {
      generateToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    loginUseCase = new LoginUseCase(
      userRepositoryMock,
      passwordHasherMock,
      tokenServiceMock
    );
  });

  it('should authenticate user and return access token when credentials are valid', async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(mockUser);
    passwordHasherMock.verify.mockResolvedValue(true);
    tokenServiceMock.generateToken.mockReturnValue('mocked.jwt.token');

    const result = await loginUseCase.execute({
      email: 'valid.user@example.com',
      password: 'validPassword123',
    });

    expect(result).toEqual({
      accessToken: 'mocked.jwt.token',
      tokenType: 'Bearer',
      expiresIn: 3600,
    });
    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith('valid.user@example.com');
    expect(passwordHasherMock.verify).toHaveBeenCalledWith(
      'validPassword123',
      mockUser.passwordHash,
      mockUser.salt
    );
    expect(tokenServiceMock.generateToken).toHaveBeenCalledWith(
      {
        userId: mockUser.id,
        role: mockUser.role,
      },
      3600
    );
  });

  it('should throw InvalidCredentialsException when email is missing or empty', async () => {
    await expect(loginUseCase.execute({ password: 'validPassword123' })).rejects.toThrow(
      InvalidCredentialsException
    );
    await expect(
      loginUseCase.execute({ email: '', password: 'validPassword123' })
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should throw InvalidCredentialsException when password is missing or empty', async () => {
    await expect(
      loginUseCase.execute({ email: 'valid.user@example.com' })
    ).rejects.toThrow(InvalidCredentialsException);
    await expect(
      loginUseCase.execute({ email: 'valid.user@example.com', password: '' })
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should throw InvalidCredentialsException when email format is invalid (RFC 5322)', async () => {
    await expect(
      loginUseCase.execute({
        email: 'invalid-email-format',
        password: 'validPassword123',
      })
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should throw InvalidCredentialsException when password is less than 8 characters', async () => {
    await expect(
      loginUseCase.execute({
        email: 'valid.user@example.com',
        password: 'short',
      })
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should throw InvalidCredentialsException when user is not found in repository', async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    await expect(
      loginUseCase.execute({
        email: 'nonexistent@example.com',
        password: 'validPassword123',
      })
    ).rejects.toThrow(InvalidCredentialsException);
    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
  });

  it('should throw InvalidCredentialsException when password verification fails', async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(mockUser);
    passwordHasherMock.verify.mockResolvedValue(false);

    await expect(
      loginUseCase.execute({
        email: 'valid.user@example.com',
        password: 'wrongPassword123',
      })
    ).rejects.toThrow(InvalidCredentialsException);
    expect(passwordHasherMock.verify).toHaveBeenCalledWith(
      'wrongPassword123',
      mockUser.passwordHash,
      mockUser.salt
    );
  });
});
