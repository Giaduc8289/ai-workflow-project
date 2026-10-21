"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const auth_exception_1 = require("../exceptions/auth.exception");
class User {
    _id;
    _email;
    _passwordHash;
    _salt;
    _role;
    _createdAt;
    _updatedAt;
    // RFC 5322 Compliant Email Regex
    static EMAIL_REGEX = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[\x00-\x04][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[\x00-\x04][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;
    constructor(props) {
        User.validateEmail(props.email);
        this._id = props.id;
        this._email = props.email.toLowerCase();
        this._passwordHash = props.passwordHash;
        this._salt = props.salt;
        this._role = props.role;
        this._createdAt = props.createdAt ?? new Date();
        this._updatedAt = props.updatedAt ?? new Date();
    }
    get id() {
        return this._id;
    }
    get email() {
        return this._email;
    }
    get passwordHash() {
        return this._passwordHash;
    }
    get salt() {
        return this._salt;
    }
    get role() {
        return this._role;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    static validateEmail(email) {
        if (!email || !User.EMAIL_REGEX.test(email)) {
            throw new auth_exception_1.InvalidInputException('Invalid email format according to RFC 5322');
        }
    }
    static validatePassword(password) {
        if (!password || password.length < 8) {
            throw new auth_exception_1.InvalidInputException('Password must be at least 8 characters long');
        }
    }
}
exports.User = User;
