import { RbfsDatabaseException, DatabaseConnectionException } from '../../core/exception';

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


export class MySqlConnection { 
  private unsafeConnection: any;
  private connected: boolean = false;

  constructor() {
    this.unsafeConnection = new mysqlNative.MySQLConnection();
  }

  connect(arg: MySqlConnectionArgument): void {
    if(this.connected)
      return ;

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
        `    ${this.lastMysqlError}\n`)
    }
  }

  get lastMysqlError(): string {
    return this.unsafeConnection._error();
  }
};