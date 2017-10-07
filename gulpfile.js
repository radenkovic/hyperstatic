var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');
concat = require('gulp-concat');
var inline = require('gulp-inline')
  , uglify = require('gulp-uglify')
  , minifyCss = require('gulp-minify-css')
  , autoprefixer = require('gulp-autoprefixer');
  var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin')
var nunjucks = require('gulp-nunjucks-html')
const RELOAD_AFTER_MS = 10;

// Static Server + watching scss/html files
gulp.task('serve', ['sass', 'js', 'nunjucks', 'copyImages'], () => {
  browserSync.init({
    server: "./src/public"
  });
  gulp.watch("src/scss/**/*.scss", ['sass']);
  gulp.watch("src/js/**/*.js", ['js']);
  gulp.watch("src/images/*", ['images']);
  gulp.watch("src/templates/**/*.html", ['nunjucks']).on('change', ()=> {
    setTimeout(()=> {
      browserSync.reload();
    }, RELOAD_AFTER_MS)
  });
});

gulp.task('sass', () => {
  return gulp.src("src/scss/**/*.scss")
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(gulp.dest("src/public/assets"))
    .pipe(browserSync.stream());
});

gulp.task('js', () => {
  return gulp.src("src/js/**/*.js")
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest("src/public/assets"))
    .pipe(browserSync.stream());
})

gulp.task('nunjucks', function() {
  return gulp.src('src/templates/*.html')
    .pipe(nunjucks({searchPaths: ['src/templates']}))
    .pipe(gulp.dest('src/public/'));
});


gulp.task('build', ['sass', 'js', 'nunjucks', 'images'], () => {
  return gulp.src('src/public/*.html')
  .pipe(inline({
    base: 'src/public/',
    js: uglify,
    css: [minifyCss, autoprefixer({ browsers:['last 2 versions'] })],
  }))
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest('dist/'));
})

gulp.task('copyImages', () => {
    return gulp.src('src/images/*')
      .pipe(gulp.dest('src/public/assets/images'))
});

gulp.task('images', () => {
    return gulp.src('src/images/*')
      .pipe(imagemin())
      .pipe(gulp.dest('src/public/assets/images'))
});

gulp.task('default', ['serve']);
