/**
 * A simple http server
 * 
 * Author: rapidhere@gmail.com
 */
'use strict';

import * as http from 'http';
import ro from '../core/ro';
import { RbfsRuntimeError } from '../core/exception';
import { Request, Response } from './context'
import { locate } from './router';
import logger from '../core/log';

export default http.createServer(function(rawRequest, rawResponse) {
  ro(function* () {
    try {
      let req = new Request(rawRequest),
        res = new Response(rawResponse);
      
      let locator = locate(req);
      let resource = new locator.resourceConstructor(req, res);

      let ret = yield* resource.invoke(locator.action);
      yield* res.json(ret);

      logger.info(`[${rawRequest.method} ${rawRequest.url}], OK\n` + ret);
    } catch (e) {
      // Send error response
      try{
        if(e instanceof RbfsRuntimeError) {
          logger.error(`[${rawRequest.method} ${rawRequest.url}] ERROR: [${e.statusCode}] ${e.errorCode}, ${e.errorMessage}`);
          yield* Response.responseError(rawResponse, e.statusCode, e.errorCode, e.errorMessage);
        } else {
          logger.error(`[${rawRequest.method} ${rawRequest.url}] Unknown Server Error:\n ${e.stack}`);
          yield* Response.responseError(rawResponse, 500, -500, e.stack);
        }
      } catch (e) {
        // CRITICAL ERROR:
        // Should not reach here
        // this handler will be invoked when send error response failed
        logger.error(`[${rawRequest.method} ${rawRequest.url}] Error Occuered when handle error:\n ${e.stack}`);
      }
    }
  });
});