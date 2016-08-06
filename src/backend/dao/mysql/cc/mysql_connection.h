/**
 * Mysql Connection(Unsafe)
 *
 * Hold A Handler to access Mysql Context
 * Author: rapidhere@gmail.com
 */

#ifndef _MYSQL_CONNECTION_H
#define _MYSQL_CONNECTION_H 1

#include <mysql.h>

#include <node.h>
#include <node_object_wrap.h>


namespace mysqlnative {


class MySQLConnection : public node::ObjectWrap {
  public:
    static void Init(v8::Local<v8::Object> exports);
  
  private:
    explicit MySQLConnection();
    ~MySQLConnection();

    static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
    static v8::Persistent<v8::Function> constructor;

    static void Connect(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void Error(const v8::FunctionCallbackInfo<v8::Value>& args);

    MYSQL* conn;
};


} // namespace mysqlnative

#endif // ifndef _MYSQL_CONNECTION_H