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


v8::Persistent<v8::Function> MySQLConnection::constructor;

MySQLConnection::MySQLConnection() {
  conn = NULL;
}

MySQLConnection::~MySQLConnection() {

}

void MySQLConnection::Init(v8::Local<v8::Object> exports) {
  v8::Isolate* isolate = exports->GetIsolate();

  // constructor template
  v8::Local<v8::FunctionTemplate> tpl = v8::FunctionTemplate::New(isolate, New);
  tpl->SetClassName(v8::String::NewFromUtf8(isolate, "MySQLConnection"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // prototypes
  NODE_SET_PROTOTYPE_METHOD(tpl, "connect", Connect);
  NODE_SET_PROTOTYPE_METHOD(tpl, "_error", Error);

  constructor.Reset(isolate, tpl->GetFunction());

  // exports
  exports->Set(v8::String::NewFromUtf8(isolate, "MySQLConnection"),
    tpl->GetFunction());
}


void MySQLConnection::New(const v8::FunctionCallbackInfo<v8::Value>& args) {
  v8::Isolate* isolate = args.GetIsolate();

  if(args.IsConstructCall()) {
    MySQLConnection* conn = new MySQLConnection();
    conn->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
  } else {
    // Not Support
    args.GetReturnValue().Set(v8::Number::New(isolate, -1));
  }
}

void MySQLConnection::Connect(const v8::FunctionCallbackInfo<v8::Value>& args) {
  v8::Isolate* isolate = args.GetIsolate();
  MySQLConnection* myconn = node::ObjectWrap::Unwrap<MySQLConnection>(args.Holder());

  // get connection arguments
  if(args.Length() < 7) {
    isolate->ThrowException(v8::Exception::TypeError(
      v8::String::NewFromUtf8(isolate, "Wrong arguments")));
    return ;
  }

  const std::string host = ObjectToStdString(args[0]->ToString()),
    user = ObjectToStdString(args[1]->ToString()),
    passwd = ObjectToStdString(args[2]->ToString()),
    db = ObjectToStdString(args[3]->ToString()),
    unix_socket = ObjectToStdString(args[5]->ToString());
  int port = (int)(args[4]->NumberValue());
  unsigned long flags = (unsigned long)(args[6]->NumberValue());

  // Already connected, do nothing
  if(myconn->conn) {
    args.GetReturnValue().Set(v8::True(isolate));
  } else {
    myconn->conn = mysql_init(NULL);

    if(! myconn->conn) {
      args.GetReturnValue().Set(v8::False(isolate));
      return;
    }

    bool connectResult = !!mysql_real_connect(
      myconn->conn,
      host.c_str(),
      user.c_str(),
      passwd.c_str(),
      db.c_str(),
      port,
      unix_socket.c_str(),
      flags);
    
    if(connectResult) {
      args.GetReturnValue().Set(v8::True(isolate));
    } else {
      args.GetReturnValue().Set(v8::False(isolate));
    }
  }
}

void MySQLConnection::Error(const v8::FunctionCallbackInfo<v8::Value>& args) {
  v8::Isolate* isolate = args.GetIsolate();
  MySQLConnection* myconn = node::ObjectWrap::Unwrap<MySQLConnection>(args.Holder());

  if(myconn->conn) {
    args.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, mysql_error(myconn->conn)));
  } else {
    args.GetReturnValue().Set(v8::Null(isolate));
  }
}

}  // namespace mysqlnative