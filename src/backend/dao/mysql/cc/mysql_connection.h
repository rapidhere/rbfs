/**
 * Mysql Connection(Unsafe)
 *
 * Hold A Handler to access Mysql Context
 * Author: rapidhere@gmail.com
 */

#ifndef _MYSQL_CONNECTION_H
#define _MYSQL_CONNECTION_H 1

#include "./mysql_native.h"

#include <mysql.h>

#include <v8.h>
#include <node.h>


namespace mysqlnative {


class MySQLConnection : public Nan::ObjectWrap {
  public:
    static void Init(v8::Local<v8::Object> exports);
  
  private:
    explicit MySQLConnection();
    ~MySQLConnection();

    static Nan::Persistent<v8::Function> constructor;


    static NAN_METHOD(New);

    static NAN_METHOD(Connect);
    static NAN_METHOD(Close);

    static NAN_METHOD(AutoCommit);
    static NAN_METHOD(Commit);
    static NAN_METHOD(Rollback);

    static NAN_METHOD(Error);

    MYSQL* conn;
};


} // namespace mysqlnative

#endif // ifndef _MYSQL_CONNECTION_H