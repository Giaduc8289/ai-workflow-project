import { User } from '../../domain/entities/user.entity';
import { InvalidCredentialsException } from '../../domain/exceptions/auth.exception';
import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { IPasswordHasher } from '../ports/password-hasher.interface';
import { ITokenService } from '../ports/token-service.interface';

export interface LoginRequestDto {
  email?: string;
  password?: string;
}

export interface LoginResponseDto {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export class LoginUseCase {
  private static readonly TOKEN_TTL_SECONDS = 3600; // 1 hour

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  public async execute(request: LoginRequestDto): Promise<LoginResponseDto> {
    // 1. Guard Clause: Check missing or invalid input
    if (!request.email || !request.password) {
      throw new InvalidCredentialsException();
    }

    try {
      User.validateEmail(request.email);
      User.validatePassword(request.password);
    } catch {
      throw new InvalidCredentialsException();
    }

    // 2. Fetch User by Email
    const user = await this.userRepository.findByEmail(request.email.toLowerCase());
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // 3. Verify Password
    const isPasswordValid = await this.passwordHasher.verify(
      request.password,
      user.passwordHash,
      user.salt
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // 4. Generate Access Token with TTL = 1 hour (3600s)
    const accessToken = this.tokenService.generateToken(
      {
        userId: user.id,
        role: user.role,
      },
      LoginUseCase.TOKEN_TTL_SECONDS
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: LoginUseCase.TOKEN_TTL_SECONDS,
    };
  }
}
