import { InvalidInputException } from '../exceptions/auth.exception';

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private readonly _id: string;
  private readonly _email: string;
  private readonly _passwordHash: string;
  private readonly _salt: string;
  private readonly _role: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  // RFC 5322 Compliant Email Regex
  private static readonly EMAIL_REGEX =
    /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[\x00-\x04][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[\x00-\x04][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;

  constructor(props: UserProps) {
    User.validateEmail(props.email);
    this._id = props.id;
    this._email = props.email.toLowerCase();
    this._passwordHash = props.passwordHash;
    this._salt = props.salt;
    this._role = props.role;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public get id(): string {
    return this._id;
  }

  public get email(): string {
    return this._email;
  }

  public get passwordHash(): string {
    return this._passwordHash;
  }

  public get salt(): string {
    return this._salt;
  }

  public get role(): string {
    return this._role;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public static validateEmail(email: string): void {
    if (!email || !User.EMAIL_REGEX.test(email)) {
      throw new InvalidInputException('Invalid email format according to RFC 5322');
    }
  }

  public static validatePassword(password: string): void {
    if (!password || password.length < 8) {
      throw new InvalidInputException('Password must be at least 8 characters long');
    }
  }
}
