RBFS - RapiD's Blog From Scratch
===

```
Just a Toy

I'll do all `backend-things` from scratch
```

Requirements
---

* node 5+
* npm
* node-gyp supports
* libmysqlclient


Build
---

### 1. Install Tools And Common Depdencies

```
npm install typescript gulp-cli tsd -g

npm install
tsd install
```

### 2. Build MySQL SDK

(Currently only build on windows supported)
* First, Check your system has `node-gyp` supports
* Then, check your system has `libmysqlclient` library

Run gulp to build
```
gulp build-mysql --msvs_version=2015 --mysql_home="C:/mysql5.7"
```

### 3. Compile Javascript and Static Contents

```
gulp build-ts
```