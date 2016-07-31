/**
 * Resource Routers
 * 
 * Author: rapidhere@gmail.com
 */
import * as exception from '../core/exception';
import { Request, Response } from './context';
import * as path from 'path';
import * as fs from 'fs';

interface ResourceConstructable {
  new(req: Request, res: Response): ResourceBase
}

interface ResourceLocator {
  resourceConstructor: ResourceConstructable
  action: ResourceAction
}

/**
 * The base resource
 * 
 * child resources implements one of the method to get handle on HTTP methods
 */
export abstract class ResourceBase {
  protected request: Request;
  protected response: Response;

  constructor(req: Request, res: Response) {
    this.request = req;
    this.response = res;
  }

  * invoke(action: ResourceAction) {
    switch(action) {
      case ResourceAction.GET: yield * this.get();
      case ResourceAction.POST: yield * this.post();
      case ResourceAction.PUT: yield * this.put();
      case ResourceAction.DELETE: yield * this.delete();
    }
  }

  * get() {
    throw new exception.MethodNotAllowed();
  }

  * post() {
    throw new exception.MethodNotAllowed();
  }

  * put() {
    throw new exception.MethodNotAllowed();
  }

  * delete() {
    throw new exception.MethodNotAllowed();
  }
}

/**
 * Class Decorator on ResourceBase classes
 * 
 * register a route info
 */
export function Route(uri: string, disabled: boolean=false) {
  return function(constructor: ResourceConstructable) {
    if(! disabled)
       registerResource(uri, constructor);
  }
}

/**
 * Actions a resource can take
 * 
 * ref to REST api
 */
export enum ResourceAction {
  GET = 1,
  POST,
  PUT,
  DELETE
}

// resources registered here
const resourceMap = new Map<string, ResourceConstructable>();

/**
 * Get a locate info from request
 */
export function locate(req: Request): ResourceLocator {
  let action = req.action;
  let rc = resourceMap.get(req.pathname);

  if(action === null) {
    throw new exception.MethodNotAllowed();
  }

  if(! rc) {
    throw new exception.NotFound();
  } 

  return {
    resourceConstructor: rc,
    action: action
  };
}

/**
 * Register a resource
 */
export function registerResource(uri: string, res: ResourceConstructable) {
  resourceMap.set(uri, res);
}

/**
 * Discover resources
 */
export function discover() {
  let resourcePath = path.join(__dirname, '..', 'resources');
  discoverDirectory(resourcePath);
}

function discoverDirectory(dirPath: string) {
  fs.readdirSync(dirPath).forEach((subPath) => {
    subPath = path.join(dirPath, subPath);
    let stats = fs.lstatSync(subPath);

    if(stats.isFile()) {
      require(subPath);
    } else {
      discoverDirectory(subPath);
    }
  });
}