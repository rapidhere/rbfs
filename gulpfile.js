var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');

gulp.task('compile', () => {
  return tsProject
    .src()
    .pipe(ts(tsProject))
    .js.pipe(gulp.dest('dist'));
});