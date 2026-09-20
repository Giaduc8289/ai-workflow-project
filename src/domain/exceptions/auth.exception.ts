export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidCredentialsException extends DomainException {
  constructor(message = 'Invalid email or password') {
    super(message);
  }
}

export class InvalidInputException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
