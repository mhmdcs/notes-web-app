class HttpError extends Error{
    constructor(message: string) { // we create a constructor for HttpError that takes in a message as an argument
        super(message); // we pass the message of the constructor to the constructor of the super class Error
        this.name = this.constructor.name; // we want the name of property of Error to be the name of the classes that will subclass HttpError
    }
}

/**
 * Status Code: 401
 */
export class UnauthorizedError extends HttpError {}

/**
 * Status Code: 409
 */
export class ConflictError extends HttpError {}

// add more HttpError subclasses if you need to distinct between them