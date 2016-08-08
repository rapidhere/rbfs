/**
 * Mysql Connection(Unsafe) Implementations
 *
 * Author: rapidhere@gmail.com
 */

#include "./mysql_connection.h"
#include "./utils.h"

#include <string>
#include <iostream>

namespace mysqlnative {


Nan::Persistent<v8::Function> MySQLConnection::constructor;

MySQLConnection::MySQLConnection() {
  conn = NULL;
}

MySQLConnection::~MySQLConnection() {

}

void MySQLConnection::Init(v8::Local<v8::Object> exports) {
  NAN_SCOPE

  // constructor template
  v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
  tpl->SetClassName(Nan::NewString("MySQLConnection"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // prototypes
  Nan::SetPrototypeMethod(tpl, "connect", Connect);
  Nan::SetPrototypeMethod(tpl, "_error", Error);
  Nan::SetPrototypeMethod(tpl, "_close", Close);
  Nan::SetPrototypeMethod(tpl, "autoCommit", AutoCommit);
  Nan::SetPrototypeMethod(tpl, "commit", Commit);
  Nan::SetPrototypeMethod(tpl, "rollback", Rollback);
  Nan::SetPrototypeMethod(tpl, "query", Query);

  constructor.Reset(tpl->GetFunction());

  // exports
  exports->Set(Nan::NewString("MySQLConnection"), tpl->GetFunction());
}

NAN_METHOD(MySQLConnection::New) {
  NAN_SCOPE

  if(info.IsConstructCall()) {
    MySQLConnection* conn = new MySQLConnection();
    conn->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
  } else {
    // Not Support
    Nan::ThrowTypeError("Only can call with constructor");
  }
}

NAN_METHOD(MySQLConnection::Connect) {
  NAN_SCOPE
  MySQLConnection* myconn = Nan::ObjectWrap::Unwrap<MySQLConnection>(info.Holder());

  // Arguments check will be done in js level
  const v8::String::Utf8Value 
    host(info[0]->ToString()),
    user(info[1]->ToString()),
    passwd(info[2]->ToString()),
    db(info[3]->ToString()),
    unix_socket(info[5]->ToString());
  int port = (int)(info[4]->NumberValue());
  unsigned long flags = (unsigned long)(info[6]->NumberValue());

  // Already connected, do nothing
  if(myconn->conn) {
    info.GetReturnValue().Set(true);
  } else {
    myconn->conn = mysql_init(NULL);

    if(! myconn->conn) {
      info.GetReturnValue().Set(false);
      return;
    }

    bool connectResult = !!mysql_real_connect(
      myconn->conn,
      *host,
      *user,
      *passwd,
      *db,
      port,
      *unix_socket,
      flags);
    
    info.GetReturnValue().Set(connectResult);
  }
}

NAN_METHOD(MySQLConnection::AutoCommit) {
  NAN_SCOPE
  MySQLConnection* myconn = Nan::ObjectWrap::Unwrap<MySQLConnection>(info.Holder());

  // Arguments check will be done in js level
  bool autoCommitFlag = info[0]->BooleanValue();

  // will not check connection state
  bool result = !mysql_autocommit(myconn->conn, autoCommitFlag);
  info.GetReturnValue().Set(result);
}

NAN_METHOD(MySQLConnection::Close) {
  NAN_SCOPE
  MySQLConnection* myconn = Nan::ObjectWrap::Unwrap<MySQLConnection>(info.Holder());

  mysql_close(myconn->conn);

  info.GetReturnValue().Set(true);
}

NAN_METHOD(MySQLConnection::Commit) {
  NAN_SCOPE
  MySQLConnection* myconn = Nan::ObjectWrap::Unwrap<MySQLConnection>(info.Holder());

  bool result = !mysql_commit(myconn->conn);
  info.GetReturnValue().Set(result);
}

NAN_METHOD(MySQLConnection::Rollback) {
  NAN_SCOPE
  MySQLConnection* myconn = Nan::ObjectWrap::Unwrap<MySQLConnection>(info.Holder());

  bool result = !mysql_rollback(myconn->conn);
  info.GetReturnValue().Set(result);
}

NAN_METHOD(MySQLConnection::Error) {
  NAN_SCOPE
  MySQLConnection* myconn = Nan::ObjectWrap::Unwrap<MySQLConnection>(info.Holder());

  if(myconn->conn) {
    info.GetReturnValue().Set(Nan::NewString(mysql_error(myconn->conn)));
  } else {
    info.GetReturnValue().SetNull();
  }
}


class QueryWorker : public Nan::AsyncWorker {
  public:
    QueryWorker(Nan::Callback* callback, MYSQL* conn, const char* statement, unsigned int length)
      : Nan::AsyncWorker(callback) {
        this->conn = conn;
        this->length = length;

        this->statement = new char[length];
        memcpy(this->statement, statement, length);
      }
    
    ~QueryWorker() {
      if(statement) {
        delete[] statement;
      }
    }

    void Execute() {
      result = !mysql_real_query(conn, statement, length);
    }
  
    virtual void HandleOKCallback() {
      NAN_SCOPE

      v8::Local<v8::Value> argv[] = {
        Nan::Null(),
        Nan::New(result)
      };

      callback->Call(2, argv);
    }

  private:
    char* statement;
    MYSQL* conn;
    unsigned int length;
    bool result; 
};

NAN_METHOD(MySQLConnection::Query) {
  NAN_SCOPE
  MySQLConnection* myconn = Nan::ObjectWrap::Unwrap<MySQLConnection>(info.Holder());

  // get arguments
  v8::String::Utf8Value statement(info[0]->ToString());
  unsigned int length = (unsigned int)(info[1]->NumberValue());
  Nan::Callback* callback = new Nan::Callback(info[2].As<v8::Function>());

  // execute async
  Nan::AsyncQueueWorker(new QueryWorker(callback, myconn->conn, *statement, length));
}

}  // namespace mysqlnative