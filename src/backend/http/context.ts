/**
 * HTTP Request and Response Context Wrapper
 * 
 * Author: rapidhere@gmail.com
 */
import * as http from 'http';
import * as url from 'url';
import { ResourceAction } from './router';
import log from '../core/log';

export class Request {
  private _rawRequest: http.IncomingMessage;
  private _uri: url.Url;

  constructor(rawRequest: http.IncomingMessage) {
    this._rawRequest = rawRequest;

    this.parseUri();
  }

  protected parseUri(): void {
    this._uri = url.parse(this._rawRequest.url);
  }

  get rawRequest() { return this._rawRequest; }

  get uri() {
    return this._uri;
  }

  get pathname() {
    return this.uri.pathname;
  }

  get query() {
    return this.uri.query;
  }

  get action(): ResourceAction{
    switch(this.rawRequest.method.toUpperCase()) {
      case "GET": return ResourceAction.GET;
      case "POST": return ResourceAction.POST;
      case "PUT": return ResourceAction.PUT;
      case "DELETE": return ResourceAction.DELETE;
    }

    return null;
  }

  get method() {
    return this.rawRequest.method.toUpperCase();
  }
}


export class Response {
  private _rawResponse: http.ServerResponse;

  constructor(rawResponse: http.ServerResponse) {
    this._rawResponse = rawResponse;
  }

  status(statusCode: number) {
    this.rawResponse.statusCode = statusCode;
    return this;
  }

  * json(obj: Object) {
    yield* Response.makeResponse(this.rawResponse, this.rawResponse.statusCode, obj);
  }

  static * makeResponse(rawResponse: http.ServerResponse, statusCode: number, obj: Object) {
    return new Promise((resolve, reject) => {
      rawResponse.statusCode = statusCode;
      rawResponse.setHeader("Content-Type", "application/json");
      rawResponse.end(JSON.stringify(obj), (err) => {
        if(err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  static * responseError(rawResponse: http.ServerResponse, statusCode: number, errorCode: number, errorMessage: string) {
    yield* Response.makeResponse(
      rawResponse,
      statusCode,
      {
        "error": {
          "code": errorCode,
          "message": errorMessage
        }
      }
    );
  }

  get rawResponse() { return this._rawResponse; }
}