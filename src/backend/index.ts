/**
 * The entry point of backend server
 * 
 * Author: rapidhere@gmail.com
 */
'use strict';

import server from './http/server';
import { discover } from './http/router';

// find resources
discover();

server.listen(4040);
