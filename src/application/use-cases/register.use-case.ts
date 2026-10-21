import { User } from '../../domain/entities/user.entity';
import { EmailAlreadyInUseException } from '../../domain/exceptions/auth.exception';
import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { IPasswordHasher } from '../ports/password-hasher.interface';
import { IIdGenerator } from '../ports/id-generator.interface';

export interface RegisterDTO {
  email: string;
  password: string;
  role?: string;
}

export interface RegisterResult {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
}

export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly idGenerator: IIdGenerator
  ) {}

  public async execute(dto: RegisterDTO): Promise<RegisterResult> {
    User.validateEmail(dto.email);
    User.validatePassword(dto.password);

    const normalizedEmail = dto.email.toLowerCase().trim();
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new EmailAlreadyInUseException();
    }

    const salt = this.passwordHasher.generateSalt
      ? await this.passwordHasher.generateSalt()
      : 'mock_salt_' + Date.now();

    const passwordHash = await this.passwordHasher.hash(dto.password, salt);
    const userId = this.idGenerator.generate();
    const role = dto.role && dto.role.trim() !== '' ? dto.role : 'MEMBER';

    const newUser = new User({
      id: userId,
      email: normalizedEmail,
      passwordHash,
      salt,
      role,
    });

    await this.userRepository.save(newUser);

    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };
  }
}