import { User } from '../../src/domain/entities/user.entity';
import { InvalidInputException } from '../../src/domain/exceptions/auth.exception';

describe('User Entity', () => {
  const validProps = {
    id: 'user-123',
    email: 'user@example.com',
    passwordHash: 'hashed_password',
    salt: 'random_salt',
    role: 'USER',
  };

  describe('Instantiation', () => {
    it('should create a User entity successfully with valid properties', () => {
      const user = new User(validProps);

      expect(user.id).toBe(validProps.id);
      expect(user.email).toBe(validProps.email.toLowerCase());
      expect(user.passwordHash).toBe(validProps.passwordHash);
      expect(user.salt).toBe(validProps.salt);
      expect(user.role).toBe(validProps.role);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should convert email to lowercase upon creation', () => {
      const user = new User({ ...validProps, email: 'USER@EXAMPLE.COM' });
      expect(user.email).toBe('user@example.com');
    });

    it('should throw InvalidInputException if email format is invalid during creation', () => {
      expect(() => new User({ ...validProps, email: 'invalid-email' })).toThrow(
        InvalidInputException
      );
    });
  });

  describe('Static Validation Methods', () => {
    describe('validateEmail', () => {
      it('should pass for valid RFC 5322 emails', () => {
        expect(() => User.validateEmail('john.doe@domain.co.uk')).not.toThrow();
        expect(() => User.validateEmail('user+label@example.org')).not.toThrow();
      });

      it('should throw InvalidInputException for invalid emails', () => {
        expect(() => User.validateEmail('')).toThrow(InvalidInputException);
        expect(() => User.validateEmail('plainaddress')).toThrow(InvalidInputException);
        expect(() => User.validateEmail('@missingusername.com')).toThrow(
          InvalidInputException
        );
        expect(() => User.validateEmail('username@.com')).toThrow(InvalidInputException);
      });
    });

    describe('validatePassword', () => {
      it('should pass for passwords with 8 characters or more', () => {
        expect(() => User.validatePassword('12345678')).not.toThrow();
        expect(() => User.validatePassword('strong_secure_password')).not.toThrow();
      });

      it('should throw InvalidInputException for passwords shorter than 8 characters', () => {
        expect(() => User.validatePassword('')).toThrow(InvalidInputException);
        expect(() => User.validatePassword('1234567')).toThrow(InvalidInputException);
      });
    });
  });
});
