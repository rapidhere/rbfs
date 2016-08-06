/**
 * Utils implematations
 *
 * Author: rapidhere@gmai.com
 */
#include "./utils.h"

namespace mysqlnative {

std::string ObjectToStdString(v8::Local<v8::Value> object) {
  v8::String::Utf8Value utf8(object);
  return std::string(*utf8);
}

} // namespace mysqlnative