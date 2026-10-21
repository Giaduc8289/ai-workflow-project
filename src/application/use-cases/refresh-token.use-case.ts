import {
  InvalidInputException,
  InvalidTokenException,
  UserNotFoundException,
} from '../../domain/exceptions/auth.exception';
import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { ITokenService } from '../ports/token-service.interface';

export interface RefreshTokenRequestDto {
  refreshToken?: string;
}

export interface TokenResponseDTO {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export class RefreshTokenUseCase {
  private static readonly ACCESS_TOKEN_TTL_SECONDS = 3600;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  public async execute(request: RefreshTokenRequestDto): Promise<TokenResponseDTO> {
    if (!request.refreshToken?.trim()) {
      throw new InvalidInputException('Refresh token is required');
    }

    let payload;
    try {
      payload = await this.tokenService.verifyRefreshToken(request.refreshToken);
    } catch {
      throw new InvalidTokenException();
    }

    if (!payload?.userId) {
      throw new InvalidTokenException();
    }

    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const accessToken = this.tokenService.generateToken(
      {
        userId: user.id,
        role: user.role,
      },
      RefreshTokenUseCase.ACCESS_TOKEN_TTL_SECONDS
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: RefreshTokenUseCase.ACCESS_TOKEN_TTL_SECONDS,
    };
  }
}
