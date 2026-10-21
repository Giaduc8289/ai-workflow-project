export interface IPasswordHasher {
  hash(password: string, salt: string): Promise<string>;
  verify(password: string, hash: string, salt: string): Promise<boolean>;
  generateSalt?(): Promise<string>;
}
