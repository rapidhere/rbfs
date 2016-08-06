const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawn;
const del = require('del');
const minimist = require('minimist');

gulp.task('build-ts', compile);
gulp.task('build-static', copy);
gulp.task('build-mysql', ['build-ts'], buildMysql);
gulp.task('stop-server', stopServer);
gulp.task('start-server', ['build-ts', 'build-static'], startServer);
gulp.task('restart-server', ['stop-server', 'build-ts', 'build-static'], startServer);
gulp.task('clean', clean);

gulp.task('watch', ['start-server'], () => {
  gulp.watch(['src/**/*', '!src/backend/dao/mysql/**/*'], ['restart-server']);
});

// get options
let optionSettings = {
  string: ['mysql_home', 'msvs_version'],

  default: {
    'mysql_home': 'no_path',
    'msvs_version': '2015'
  }
};
let options = minimist(process.argv.slice(2), optionSettings);

// tasks

function compile() {
  return tsProject
    .src()
    .pipe(ts(tsProject))
    .js.pipe(gulp.dest('dist'));
}

function copy() {
  // do nothing
}

//~ http server task(only for debug usage)
const PID_FILE_PATH = path.join(__dirname, '.pid');
const SERVER_INDEX_PATH = path.join(__dirname, 'dist', 'index.js');

function stopServer(cb) {
  fs.readFile(PID_FILE_PATH, (err, pid) => {
    if(err) {
      cb(err);
    }

    process.kill(parseInt(pid), 'SIGTERM');
    cb(null, true);
  });
}

function startServer() {
  const serverProcess = spawn('node', [SERVER_INDEX_PATH]);
  fs.writeFile(PID_FILE_PATH, serverProcess.pid);
  serverProcess.stdout.on('data', writeOutput);
  serverProcess.stderr.on('data', writeOutput);
  serverProcess.on('close', (code) => {
    console.error(`# server exited with code ${code}`);
  });
  serverProcess.on('error', (err) => {
    console.error(`# failed to start server: ${err}`);
  });
}

function writeOutput(data) {
  // TODO: 支持gbk
  fs.write(1, data.toString());
}

function clean() {
  del('dist', '.pid');
}

const MYSQL_BUILD_PATH = path.join(__dirname, 'dist', 'backend', 'dao', 'mysql')
const MYSQL_SOURCE_PATH = path.join(__dirname, 'src', 'backend', 'dao', 'mysql')

function buildMysql(cb) {
  gulp.src([path.join(MYSQL_SOURCE_PATH, "**", "*"), "!" + path.join(MYSQL_SOURCE_PATH, "**", "*.ts")])
    .pipe(gulp.dest(MYSQL_BUILD_PATH))
    .on('end', configure);

  function configure() {
    console.log('running node-gyp configure ...');

    const gyp = spawn('node-gyp', [
      '-C',
      MYSQL_BUILD_PATH,
      'configure',
      `--msvs_version=${options.msvs_version}`,
      '--',
      `-Dmysql_home="${options.mysql_home}"`
    ], {
      'shell': true});

    gyp.stderr.on('data', writeOutput);
    gyp.stdout.on('data', writeOutput);
    gyp.on('close', function(code) {
      if(code != 0) {
        cb('exit with ' + code);
        return ;
      }
      build();
    });
  }

  function build() {
    console.log('running node-gyp build ...');

    const gyp = spawn('node-gyp', [
      '-C',
      MYSQL_BUILD_PATH,
      'build',
      `--msvs_version=${options.msvs_version}`,
    ], {
      'shell': true});

    gyp.stderr.on('data', writeOutput);
    gyp.stdout.on('data', writeOutput);
    gyp.on('close', function(code) {
      if(code != 0) {
        cb('exit with ' + code);
        return ;
      }
      cb();});
  }
}