"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailAlreadyInUseException = exports.InvalidInputException = exports.InvalidCredentialsException = exports.DomainException = void 0;
class DomainException extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.DomainException = DomainException;
class InvalidCredentialsException extends DomainException {
    constructor(message = 'Invalid email or password') {
        super(message);
    }
}
exports.InvalidCredentialsException = InvalidCredentialsException;
class InvalidInputException extends DomainException {
    constructor(message) {
        super(message);
    }
}
exports.InvalidInputException = InvalidInputException;
class EmailAlreadyInUseException extends DomainException {
    constructor(message = 'Email is already registered') {
        super(message);
    }
}
exports.EmailAlreadyInUseException = EmailAlreadyInUseException;
