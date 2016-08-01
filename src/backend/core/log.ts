/**
 * A simple logger
 * 
 * Author: rapidhere@gmail.com
 */
const dateFormat = require('dateformat');

export interface Logger {
  debug(message: string): void
  info(message: string): void
  warn(message: string): void
  error(message: string): void
}

export default {
	debug(message: string) {
    __log('DEBUG', message);
  },

  info(message: string) {
    __log('INFO', message);
  },

	warn(message: string) {
    __log('WARNING', message);
  },

	error(message: string) {
    __log('ERROR', message);
  }
};


function __log(category: string, message: string): void {
  let timeString = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss.l');
  console.log(`[${timeString}] [${category}] [${message}]`);
}