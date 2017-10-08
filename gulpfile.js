const gulp          = require('gulp');
const browserSync   = require('browser-sync').create();
const sass          = require('gulp-sass');
const concat        = require('gulp-concat');
const inline        = require('gulp-inline')
const uglify        = require('gulp-uglify')
const minifyCss     = require('gulp-minify-css')
const autoprefixer  = require('gulp-autoprefixer');
const htmlmin       = require('gulp-htmlmin');
const imagemin      = require('gulp-imagemin')
const nunjucks      = require('gulp-nunjucks-html')
const fs = require('fs')
const glob = require('glob')
const eventStream =  require('event-stream')



// CONFIG
const RELOAD_AFTER_MS = 10;

// Static Server + watching scss/html files
gulp.task('serve', ['sass', 'js', 'nunjucks', 'copyImages', 'references'], () => {
  browserSync.init({
    server: "./src/public"
  });
  gulp.watch("src/scss/**/*.scss", ['sass']);
  gulp.watch("src/js/**/*.js", ['js']);
  gulp.watch("src/images/*", ['images']);
  gulp.watch("src/references/*", ['references']);
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

gulp.task('copyImages', () => {
    return gulp.src('src/images/**/*')
      .pipe(gulp.dest('src/public/assets/images'))
});

gulp.task('images', () => {
    return gulp.src('src/images/**/*')
      .pipe(imagemin())
      .pipe(gulp.dest('src/public/assets/images'))
});

gulp.task('references', () => {
    return gulp.src('src/references/**/*')
      .pipe(gulp.dest('src/public/references'))
});

gulp.task('copyReferences', () => {
    return gulp.src('src/references/**/*')
      .pipe(gulp.dest('dist/references'))
});

gulp.task('docs', () => {
  return gulp.src('dist/*')
    .pipe(gulp.dest('docs'))
})

// BUILD TASK
gulp.task('build', ['sass', 'js', 'nunjucks', 'images', 'copyReferences'], (done) => {
  // References
  const items = fs.readdirSync('src/public/references');
  const IGNORED_FILES = items.map(item => `references/${item}`)

  glob('./src/public/' + '*.html', (err, files) => {
     if (err) return done(err);
     let tasks = files.map(file => {
       return gulp.src(file)
       .pipe(inline({
         base: 'src/public',
         js: uglify,
         css: [minifyCss, autoprefixer({ browsers:['last 2 versions'] })],
         ignore: IGNORED_FILES
       }))
       .pipe(htmlmin({collapseWhitespace: true}))
       .pipe(gulp.dest('dist'));
     });
     eventStream.merge(tasks).on('end', done);
 });
})


gulp.task('default', ['serve']);
