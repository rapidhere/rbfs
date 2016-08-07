/**
 * Unsafe Mysql Module wrapper
 * 
 * Author: rapidhere@gmail.com
 */
import {
  RbfsDatabaseException,
  DatabaseConnectionException,
  DatabaseNotConnected,
  DatabaseTransactionError
} from '../../core/exception';

const mysqlNative = require('./build/Release/mysql_native');


interface MySqlConnectionArgument {
  username: string,
  db: string,
  password: string,

  hostname?: string,
  port?: number | string,
  socket_file?: string,
  flags?: number
}

interface QueryCallback {
  (err: Error, result: boolean): void
}

export class MySqlConnection { 
  private unsafeConnection: any;
  private connected: boolean = false;

  constructor() {
    this.unsafeConnection = new mysqlNative.MySQLConnection();
  }

  connect(arg: MySqlConnectionArgument): void {
    if(this.connected)
      return ;

    if(! this.unsafeConnection)
      this.unsafeConnection = new mysqlNative.MySQLConnection();

    arg.hostname = arg.hostname || 'localhost';
    arg.port = parseInt('' + arg.port) || 3306;
    arg.socket_file = arg.socket_file || '';
    arg.flags = parseInt('' + arg.flags) || 0;

    this.connected = this.unsafeConnection.connect(
      arg.hostname,
      arg.username,
      arg.password,
      arg.db,
      arg.port,
      arg.socket_file,
      arg.flags);

    if(!this.connected) {
      throw new DatabaseConnectionException(
        `Failed to connect to mysql: ${arg.db}-${arg.username}@${arg.hostname}:${arg.port}:\n` +
        `    ${this.lastMySqlError}\n`)
    }
  }

  close(): void {
    this.unsafe._close();
    this.unsafeConnection = null;
    this.connected = false;
  }

  commit(): void {
    if(! this.unsafe.commit()) {
      throw new DatabaseTransactionError(
        'Transaction commit failed: ' + this.lastMySqlError);
    }
  }

  rollback(): void {
    if(! this.unsafe.rollback()) {
      throw new DatabaseTransactionError(
        'Transaction rollback failed: ' + this.lastMySqlError);
    }
  }

  query(statement: string, callback: QueryCallback): void {
    this.unsafe.query(statement, statement.length, callback);
  }

  set autoCommit(flag: boolean) {
    if(! this.unsafe.autoCommit(flag)) {
      throw new RbfsDatabaseException(
        'Set auto commit failed: ' + this.lastMySqlError);
    }
  }
  
  get lastMySqlError(): string {
    return this.unsafeConnection._error();
  }

  private get unsafe() {
    if(!this.connected) {
      throw new DatabaseNotConnected();
    }

    return this.unsafeConnection;
  }
};