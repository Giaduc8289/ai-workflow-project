import { RefreshTokenUseCase } from '../../src/application/use-cases/refresh-token.use-case';
import { ITokenService } from '../../src/application/ports/token-service.interface';
import { IUserRepository } from '../../src/domain/repositories/user-repository.interface';
import {
  InvalidInputException,
  InvalidTokenException,
  UserNotFoundException,
} from '../../src/domain/exceptions/auth.exception';
import { User } from '../../src/domain/entities/user.entity';

describe('RefreshTokenUseCase Unit Tests', () => {
  let userRepositoryMock: jest.Mocked<IUserRepository>;
  let tokenServiceMock: jest.Mocked<ITokenService>;
  let refreshTokenUseCase: RefreshTokenUseCase;

  const mockUser = new User({
    id: 'user-001',
    email: 'valid.user@example.com',
    passwordHash: 'hashed_secret_password',
    salt: 'salt_123',
    role: 'ADMIN',
  });

  beforeEach(() => {
    userRepositoryMock = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };

    tokenServiceMock = {
      generateToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    refreshTokenUseCase = new RefreshTokenUseCase(userRepositoryMock, tokenServiceMock);
  });

  describe('Refresh token validation', () => {
    it('should throw InvalidInputException when refresh token is missing or empty', async () => {
      await expect(refreshTokenUseCase.execute({})).rejects.toThrow(InvalidInputException);
      await expect(
        refreshTokenUseCase.execute({ refreshToken: '' })
      ).rejects.toThrow(InvalidInputException);

      expect(tokenServiceMock.verifyRefreshToken).not.toHaveBeenCalled();
      expect(userRepositoryMock.findById).not.toHaveBeenCalled();
    });

    it('should throw InvalidTokenException when refresh token verification returns null', async () => {
      tokenServiceMock.verifyRefreshToken.mockResolvedValue(null);

      await expect(
        refreshTokenUseCase.execute({ refreshToken: 'invalid.refresh.token' })
      ).rejects.toThrow(InvalidTokenException);

      expect(tokenServiceMock.verifyRefreshToken).toHaveBeenCalledWith(
        'invalid.refresh.token'
      );
      expect(userRepositoryMock.findById).not.toHaveBeenCalled();
      expect(tokenServiceMock.generateToken).not.toHaveBeenCalled();
    });

    it.each([
      ['expired token', new Error('Refresh token has expired')],
      ['token with an invalid signature', new Error('Invalid token signature')],
    ])('should throw InvalidTokenException for %s', async (_scenario, error) => {
      tokenServiceMock.verifyRefreshToken.mockRejectedValue(error);

      await expect(
        refreshTokenUseCase.execute({ refreshToken: 'invalid.refresh.token' })
      ).rejects.toThrow(InvalidTokenException);

      expect(userRepositoryMock.findById).not.toHaveBeenCalled();
      expect(tokenServiceMock.generateToken).not.toHaveBeenCalled();
    });
  });

  describe('User lookup', () => {
    it('should throw UserNotFoundException when verified token user does not exist', async () => {
      tokenServiceMock.verifyRefreshToken.mockResolvedValue({
        userId: 'missing-user',
        role: 'MEMBER',
      });
      userRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        refreshTokenUseCase.execute({ refreshToken: 'valid.refresh.token' })
      ).rejects.toThrow(UserNotFoundException);

      expect(userRepositoryMock.findById).toHaveBeenCalledWith('missing-user');
      expect(tokenServiceMock.generateToken).not.toHaveBeenCalled();
    });
  });

  describe('Successful token refresh', () => {
    it('should return a new bearer access token when refresh token and user are valid', async () => {
      tokenServiceMock.verifyRefreshToken.mockResolvedValue({
        userId: mockUser.id,
        role: mockUser.role,
      });
      userRepositoryMock.findById.mockResolvedValue(mockUser);
      tokenServiceMock.generateToken.mockReturnValue('new.access.token');

      const result = await refreshTokenUseCase.execute({
        refreshToken: 'valid.refresh.token',
      });

      expect(result).toEqual({
        accessToken: 'new.access.token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      });
      expect(tokenServiceMock.verifyRefreshToken).toHaveBeenCalledWith(
        'valid.refresh.token'
      );
      expect(userRepositoryMock.findById).toHaveBeenCalledWith(mockUser.id);
      expect(tokenServiceMock.generateToken).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          role: mockUser.role,
        },
        3600
      );
    });
  });
});
