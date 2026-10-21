"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_entity_1 = require("../../src/domain/entities/user.entity");
const auth_exception_1 = require("../../src/domain/exceptions/auth.exception");
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
            const user = new user_entity_1.User(validProps);
            expect(user.id).toBe(validProps.id);
            expect(user.email).toBe(validProps.email.toLowerCase());
            expect(user.passwordHash).toBe(validProps.passwordHash);
            expect(user.salt).toBe(validProps.salt);
            expect(user.role).toBe(validProps.role);
            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);
        });
        it('should convert email to lowercase upon creation', () => {
            const user = new user_entity_1.User({ ...validProps, email: 'USER@EXAMPLE.COM' });
            expect(user.email).toBe('user@example.com');
        });
        it('should throw InvalidInputException if email format is invalid during creation', () => {
            expect(() => new user_entity_1.User({ ...validProps, email: 'invalid-email' })).toThrow(auth_exception_1.InvalidInputException);
        });
    });
    describe('Static Validation Methods', () => {
        describe('validateEmail', () => {
            it('should pass for valid RFC 5322 emails', () => {
                expect(() => user_entity_1.User.validateEmail('john.doe@domain.co.uk')).not.toThrow();
                expect(() => user_entity_1.User.validateEmail('user+label@example.org')).not.toThrow();
            });
            it('should throw InvalidInputException for invalid emails', () => {
                expect(() => user_entity_1.User.validateEmail('')).toThrow(auth_exception_1.InvalidInputException);
                expect(() => user_entity_1.User.validateEmail('plainaddress')).toThrow(auth_exception_1.InvalidInputException);
                expect(() => user_entity_1.User.validateEmail('@missingusername.com')).toThrow(auth_exception_1.InvalidInputException);
                expect(() => user_entity_1.User.validateEmail('username@.com')).toThrow(auth_exception_1.InvalidInputException);
            });
        });
        describe('validatePassword', () => {
            it('should pass for passwords with 8 characters or more', () => {
                expect(() => user_entity_1.User.validatePassword('12345678')).not.toThrow();
                expect(() => user_entity_1.User.validatePassword('strong_secure_password')).not.toThrow();
            });
            it('should throw InvalidInputException for passwords shorter than 8 characters', () => {
                expect(() => user_entity_1.User.validatePassword('')).toThrow(auth_exception_1.InvalidInputException);
                expect(() => user_entity_1.User.validatePassword('1234567')).toThrow(auth_exception_1.InvalidInputException);
            });
        });
    });
});
