const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawn;
const del = require('del');

gulp.task('compile', compile);
gulp.task('build', ['compile'], copy);
gulp.task('stop-server', stopServer);
gulp.task('start-server', ['build'], startServer);
gulp.task('restart-server', ['stop-server', 'build'], startServer);
gulp.task('clean', clean);

gulp.task('watch', ['start-server'], () => {
  gulp.watch('src/**/*', ['restart-server']);
});

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
  serverProcess.stdout.on('data', logServerOutput);
  serverProcess.stderr.on('data', logServerOutput);
  serverProcess.on('close', (code) => {
    console.error(`# server exited with code ${code}`);
  });
  serverProcess.on('error', (err) => {
    console.error(`# failed to start server: ${err}`);
  });
}

function logServerOutput(data) {
  fs.write(1, data.toString());
}

function clean() {
  del('dist', '.pid');
}