import request from 'supertest';
import {
  InvalidCredentialsException,
  InvalidInputException,
  InvalidTokenException,
  EmailAlreadyInUseException,
  UserNotFoundException,
} from '../../src/domain/exceptions/auth.exception';
import { createApp } from '../../src/infrastructure/http/app';

describe('Authentication HTTP routes', () => {
  const registerUseCase = { execute: jest.fn() };
  const loginUseCase = { execute: jest.fn() };
  const refreshTokenUseCase = { execute: jest.fn() };
  const app = createApp({ registerUseCase, loginUseCase, refreshTokenUseCase });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('returns 201 and the created user details for valid input', async () => {
      registerUseCase.execute.mockResolvedValue({
        id: 'user-123',
        email: 'new.user@example.com',
        role: 'MEMBER',
        createdAt: new Date('2026-01-02T03:04:05.000Z'),
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'new.user@example.com', password: 'securePassword123' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: 'user-123',
        email: 'new.user@example.com',
        role: 'MEMBER',
        createdAt: '2026-01-02T03:04:05.000Z',
      });
      expect(registerUseCase.execute).toHaveBeenCalledWith({
        email: 'new.user@example.com',
        password: 'securePassword123',
      });
    });

    it.each([
      ['an invalid email', { email: 'not-an-email', password: 'securePassword123' }],
      ['a short password', { email: 'new.user@example.com', password: 'short' }],
    ])('returns 400 for %s', async (_scenario, body) => {
      registerUseCase.execute.mockRejectedValue(new InvalidInputException('Invalid input'));

      const response = await request(app).post('/api/v1/auth/register').send(body);

      expect(response.status).toBe(400);
    });

    it('returns 409 when the email is already registered', async () => {
      registerUseCase.execute.mockRejectedValue(new EmailAlreadyInUseException());

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'existing@example.com', password: 'securePassword123' });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns 200 and the access token details for valid credentials', async () => {
      loginUseCase.execute.mockResolvedValue({
        accessToken: 'access.token.value',
        tokenType: 'Bearer',
        expiresIn: 3600,
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@example.com', password: 'securePassword123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        accessToken: 'access.token.value',
        tokenType: 'Bearer',
        expiresIn: 3600,
      });
    });

    it.each(['wrong password', 'unknown account'])(
      'returns 401 for %s',
      async () => {
        loginUseCase.execute.mockRejectedValue(new InvalidCredentialsException());

        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'user@example.com', password: 'securePassword123' });

        expect(response.status).toBe(401);
      }
    );
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    it('returns 200 and a new access token for a valid refresh token', async () => {
      refreshTokenUseCase.execute.mockResolvedValue({
        accessToken: 'new.access.token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      });

      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: 'valid.refresh.token' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        accessToken: 'new.access.token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      });
    });

    it('returns 401 when the refresh token is invalid or expired', async () => {
      refreshTokenUseCase.execute.mockRejectedValue(new InvalidTokenException());

      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: 'invalid.refresh.token' });

      expect(response.status).toBe(401);
    });

    it('returns 404 when the verified token references a missing user', async () => {
      refreshTokenUseCase.execute.mockRejectedValue(new UserNotFoundException());

      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: 'valid.refresh.token' });

      expect(response.status).toBe(404);
    });

    it('returns 400 when the refresh token is missing', async () => {
      refreshTokenUseCase.execute.mockRejectedValue(
        new InvalidInputException('Refresh token is required')
      );

      const response = await request(app).post('/api/v1/auth/refresh-token').send({});

      expect(response.status).toBe(400);
    });
  });

  it('does not expose error details or stack traces in production', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    refreshTokenUseCase.execute.mockRejectedValue(new Error('private internal details'));

    try {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: 'valid.refresh.token' });

      expect(response.status).toBe(500);
      expect(JSON.stringify(response.body)).not.toContain('private internal details');
      expect(response.body).not.toHaveProperty('stack');
    } finally {
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = originalNodeEnv;
      }
    }
  });
});
