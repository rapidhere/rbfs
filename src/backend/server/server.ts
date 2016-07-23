/**
 * A simple http server
 * 
 * Author: rapidhere@gmail.com
 */
'use strict';

import http = require('http');

export = http.createServer(function(req, res) {
    res.end("Hello World");
});