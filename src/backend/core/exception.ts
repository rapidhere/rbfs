/**
 * Some Exceptions
 * 
 * Author: rapidhere@gmail.com
 */

export class RbfsException extends Error {

}

export class RbfsHttpException extends Error {
  protected _code: number;

  constructor(code: number) {
    super("Http Error: " + code);

    this._code = code;
  }

  get code() { return this._code; }
}

export class MethodNotAllowed extends RbfsHttpException {
  constructor() {
    super(405);
  }
}

export class NotFound extends RbfsHttpException {
  constructor() {
    super(404);
  }
}