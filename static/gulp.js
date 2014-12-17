var gulp = require('gulp'),
  handlebars = require('gulp-ember-handlebars'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat');

gulp.task('css', function() {
  return gulp.src('css/*.css')
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest('dist/css'));
});
