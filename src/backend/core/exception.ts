/**
 * Some Exceptions
 * 
 * Author: rapidhere@gmail.com
 */

export class RbfsException extends Error {

}

export class RbfsDatabaseException extends RbfsException { 
  constructor(message: string) {
    super(message);
  }
}

export class DatabaseConnectionException extends RbfsDatabaseException {

}

export class DatabaseNotConnected extends RbfsDatabaseException {
  constructor() {
    super('You havn\'t connected to database yet');
  }
}

export class DatabaseTransactionError extends RbfsDatabaseException {

}


export class RbfsRuntimeError extends RbfsException {
  protected _errorCode: number;
  protected _errorMessage: string;
  protected _statusCode: number = 200;

  get errorCode() { return this._errorCode; }
  get errorMessage() { return this._errorMessage; }
  get statusCode() { return this._statusCode; }
}

//~ Common Http Errors
export class RbfsHttpException extends RbfsRuntimeError {
  constructor(code: number, message: string) {
    super();

    this._errorCode = -code;
    this._errorMessage = message;
    this._statusCode = code;
  }
}

export class MethodNotAllowed extends RbfsHttpException {
  constructor() {
    super(405, "Method Not Allowed");
  }
}

export class NotFound extends RbfsHttpException {
  constructor() {
    super(404, "Not Found");
  }
}