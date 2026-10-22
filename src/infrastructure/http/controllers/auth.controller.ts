import { Request, Response } from 'express';
import { LoginRequestDto, LoginUseCase } from '../../../application/use-cases/login.use-case';
import { RefreshTokenRequestDto, RefreshTokenUseCase } from '../../../application/use-cases/refresh-token.use-case';
import { RegisterDTO, RegisterUseCase } from '../../../application/use-cases/register.use-case';

export interface AuthUseCases {
  registerUseCase: Pick<RegisterUseCase, 'execute'>;
  loginUseCase: Pick<LoginUseCase, 'execute'>;
  refreshTokenUseCase: Pick<RefreshTokenUseCase, 'execute'>;
}

export class AuthController {
  constructor(private readonly useCases: AuthUseCases) {}

  public register = async (
    request: Request<Record<string, string>, unknown, RegisterDTO>,
    response: Response
  ): Promise<void> => {
    const result = await this.useCases.registerUseCase.execute(request.body);
    response.status(201).json(result);
  };

  public login = async (
    request: Request<Record<string, string>, unknown, LoginRequestDto>,
    response: Response
  ): Promise<void> => {
    const result = await this.useCases.loginUseCase.execute(request.body);
    response.status(200).json(result);
  };

  public refreshToken = async (
    request: Request<Record<string, string>, unknown, RefreshTokenRequestDto>,
    response: Response
  ): Promise<void> => {
    const result = await this.useCases.refreshTokenUseCase.execute(request.body);
    response.status(200).json(result);
  };
}
