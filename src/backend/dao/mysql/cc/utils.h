/**
 * Some utils
 *
 * Author: rapidhere@gmail.com
 */
#ifndef _UTILS_H
#define _UTILS_H 1

#include <string>
#include <v8.h>

namespace mysqlnative {

/**
 * Conert a V8 Object to a std string
 */
std::string ObjectToStdString(v8::Local<v8::Value> object);

} // namespace mysqlnative

#endif  // ifndef _UTILS_H