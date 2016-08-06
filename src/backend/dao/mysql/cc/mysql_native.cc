/**
 * Mysql Native Module Entry
 *
 * Author: rapidhere@gmail.com
 */
#include <node.h>

#include "./mysql_connection.h"


namespace mysqlnative {


void InitMysqlNative(v8::Handle<v8::Object> exports) {
  MySQLConnection::Init(exports);
}

NODE_MODULE(mysql_native, InitMysqlNative)


} // namespace mysqlnative