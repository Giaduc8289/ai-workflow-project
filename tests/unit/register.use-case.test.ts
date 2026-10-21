import { RegisterUseCase } from '../../src/application/use-cases/register.use-case';
import { IUserRepository } from '../../src/domain/repositories/user-repository.interface';
import { IPasswordHasher } from '../../src/application/ports/password-hasher.interface';
import { IIdGenerator } from '../../src/application/ports/id-generator.interface';
import { InvalidInputException, EmailAlreadyInUseException } from '../../src/domain/exceptions/auth.exception';
import { User } from '../../src/domain/entities/user.entity';

describe('RegisterUseCase Unit Tests', () => {
  let userRepositoryMock: jest.Mocked<IUserRepository>;
  let passwordHasherMock: jest.Mocked<IPasswordHasher>;
  let idGeneratorMock: jest.Mocked<IIdGenerator>;
  let registerUseCase: RegisterUseCase;

  beforeEach(() => {
    userRepositoryMock = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as any;

    passwordHasherMock = {
      hash: jest.fn(),
      verify: jest.fn(),
    };

    idGeneratorMock = {
      generate: jest.fn(),
    };

    registerUseCase = new RegisterUseCase(
      userRepositoryMock,
      passwordHasherMock,
      idGeneratorMock
    );
  });

  describe('Input Validation', () => {
    it('should throw InvalidInputException when email format is invalid', async () => {
      const request = { email: 'invalid-email', password: 'password123' };

      await expect(registerUseCase.execute(request)).rejects.toThrow(
        InvalidInputException
      );
      await expect(registerUseCase.execute(request)).rejects.toThrow(
        'Invalid email format according to RFC 5322'
      );
    });

    it('should throw InvalidInputException when password is less than 8 characters', async () => {
      const request = { email: 'valid@example.com', password: 'short' };

      await expect(registerUseCase.execute(request)).rejects.toThrow(
        InvalidInputException
      );
      await expect(registerUseCase.execute(request)).rejects.toThrow(
        'Password must be at least 8 characters long'
      );
    });
  });

  describe('Business Logic Validation', () => {
    it('should throw EmailAlreadyInUseException when email already exists', async () => {
      const request = { email: 'existing@example.com', password: 'password123' };
      
      // Mock existing user
      userRepositoryMock.findByEmail.mockResolvedValue(
        new User({
          id: 'existing-id',
          email: 'existing@example.com',
          passwordHash: 'hash',
          salt: 'salt',
          role: 'MEMBER'
        })
      );

      await expect(registerUseCase.execute(request)).rejects.toThrow(
        EmailAlreadyInUseException
      );
      expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith('existing@example.com');
    });
  });

  describe('Successful Registration', () => {
    it('should register a new user with default role MEMBER when role is not provided', async () => {
      const request = { email: 'newuser@example.com', password: 'securePassword123' };
      
      userRepositoryMock.findByEmail.mockResolvedValue(null);
      idGeneratorMock.generate.mockReturnValue('new-uuid-123');
      passwordHasherMock.hash.mockResolvedValue('hashed_password_abc');
      userRepositoryMock.save.mockResolvedValue(undefined);

      const result = await registerUseCase.execute(request);

      // Verify DTO return
      expect(result).toEqual({
        id: 'new-uuid-123',
        email: 'newuser@example.com',
        role: 'MEMBER',
        createdAt: expect.any(Date)
      });

      // Verify logic steps
      expect(idGeneratorMock.generate).toHaveBeenCalled();
      expect(passwordHasherMock.hash).toHaveBeenCalledWith('securePassword123', expect.any(String));
      expect(userRepositoryMock.save).toHaveBeenCalledWith(expect.any(User));
      
      const savedUser = userRepositoryMock.save.mock.calls[0][0];
      expect(savedUser.email).toBe('newuser@example.com');
      expect(savedUser.role).toBe('MEMBER');
      expect(savedUser.passwordHash).toBe('hashed_password_abc');
    });

    it('should register a new user with provided role (e.g., ADMIN)', async () => {
      const request = { 
        email: 'admin@example.com', 
        password: 'securePassword123',
        role: 'ADMIN'
      };
      
      userRepositoryMock.findByEmail.mockResolvedValue(null);
      idGeneratorMock.generate.mockReturnValue('admin-uuid');
      passwordHasherMock.hash.mockResolvedValue('hashed_admin_pass');

      const result = await registerUseCase.execute(request);

      expect(result.role).toBe('ADMIN');
      const savedUser = userRepositoryMock.save.mock.calls[0][0];
      expect(savedUser.role).toBe('ADMIN');
    });
  });
});
