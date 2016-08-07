#ifndef _MYSQL_NATIVE_H
#define _MYSQL_NATIVE_H

#include <nan.h>
#include <v8.h>

// some Nan Helpers
namespace Nan {

inline v8::Local<v8::String> NewString(const char* raw) {
  return New(raw).ToLocalChecked();
}

#define NAN_SCOPE Nan::HandleScope scope;

} // namespace Nan


#endif // ifndef _MYSQL_NATIVE_H