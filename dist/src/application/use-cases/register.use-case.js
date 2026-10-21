"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUseCase = void 0;
const user_entity_1 = require("../../domain/entities/user.entity");
const auth_exception_1 = require("../../domain/exceptions/auth.exception");
class RegisterUseCase {
    userRepository;
    passwordHasher;
    idGenerator;
    constructor(userRepository, passwordHasher, idGenerator) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.idGenerator = idGenerator;
    }
    async execute(dto) {
        user_entity_1.User.validateEmail(dto.email);
        user_entity_1.User.validatePassword(dto.password);
        const normalizedEmail = dto.email.toLowerCase().trim();
        const existingUser = await this.userRepository.findByEmail(normalizedEmail);
        if (existingUser) {
            throw new auth_exception_1.EmailAlreadyInUseException();
        }
        const salt = this.passwordHasher.generateSalt
            ? await this.passwordHasher.generateSalt()
            : 'mock_salt_' + Date.now();
        const passwordHash = await this.passwordHasher.hash(dto.password, salt);
        const userId = this.idGenerator.generate();
        const role = dto.role && dto.role.trim() !== '' ? dto.role : 'MEMBER';
        const newUser = new user_entity_1.User({
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
exports.RegisterUseCase = RegisterUseCase;
