/**
 * Mysql Native Module Entry
 *
 * Author: rapidhere@gmail.com
 */
#include "./mysql_connection.h"

#include <node.h>


namespace mysqlnative {


void InitMysqlNative(v8::Handle<v8::Object> exports) {
  MySQLConnection::Init(exports);
}

NODE_MODULE(mysql_native, InitMysqlNative)


} // namespace mysqlnative