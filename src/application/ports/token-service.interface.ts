export interface TokenPayload {
  userId: string;
  role: string;
}

export interface ITokenService {
  generateToken(payload: TokenPayload, expiresInSeconds: number): string;
}
