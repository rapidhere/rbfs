/**
 * A simple http server
 * 
 * Author: rapidhere@gmail.com
 */
'use strict';

import * as http from 'http';
import ro from '../core/ro';
import { RbfsHttpException } from '../core/exception';
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

      yield * resource.invoke(locator.action);
    } catch (e) {
      if(e instanceof RbfsHttpException) {
        logger.error(`[${rawRequest.method} ${rawRequest.url}] HTTP-ERROR: ${e.code}`);
        rawResponse.statusCode = e.code;
        rawResponse.end();
      } else {
        logger.error(`[${rawRequest.method} ${rawRequest.url}] Unknown Server Error:\n ${e.stack}`);
        rawResponse.statusCode = 500;
        rawResponse.end(e.stack);
      }
    }
  });
});