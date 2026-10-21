"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
const user_entity_1 = require("../../domain/entities/user.entity");
const auth_exception_1 = require("../../domain/exceptions/auth.exception");
class LoginUseCase {
    userRepository;
    passwordHasher;
    tokenService;
    static TOKEN_TTL_SECONDS = 3600; // 1 hour
    constructor(userRepository, passwordHasher, tokenService) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
    }
    async execute(request) {
        // 1. Guard Clause: Check missing or invalid input
        if (!request.email || !request.password) {
            throw new auth_exception_1.InvalidCredentialsException();
        }
        try {
            user_entity_1.User.validateEmail(request.email);
            user_entity_1.User.validatePassword(request.password);
        }
        catch {
            throw new auth_exception_1.InvalidCredentialsException();
        }
        // 2. Fetch User by Email
        const user = await this.userRepository.findByEmail(request.email.toLowerCase());
        if (!user) {
            throw new auth_exception_1.InvalidCredentialsException();
        }
        // 3. Verify Password
        const isPasswordValid = await this.passwordHasher.verify(request.password, user.passwordHash, user.salt);
        if (!isPasswordValid) {
            throw new auth_exception_1.InvalidCredentialsException();
        }
        // 4. Generate Access Token with TTL = 1 hour (3600s)
        const accessToken = this.tokenService.generateToken({
            userId: user.id,
            role: user.role,
        }, LoginUseCase.TOKEN_TTL_SECONDS);
        return {
            accessToken,
            tokenType: 'Bearer',
            expiresIn: LoginUseCase.TOKEN_TTL_SECONDS,
        };
    }
}
exports.LoginUseCase = LoginUseCase;
