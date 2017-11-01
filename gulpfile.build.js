const path = require('path')
const fs            = require('fs')
const yaml          = require('js-yaml')
const minifyCss     = require('gulp-minify-css')
const autoprefixer  = require('gulp-autoprefixer')
const htmlmin       = require('gulp-htmlmin')
const uglify        = require('gulp-uglify')
const imagemin      = require('gulp-imagemin')
const inline        = require('gulp-inline')
const glob          = require('glob')
const eventStream   =  require('event-stream')
const gulp          = require('gulp')
const runSequence = require('gulp-sequence')
const rimraf       = require('rimraf')

// Get document, or throw exception on error
let CONFIG_OBJECT = {};

try {
  CONFIG_OBJECT = yaml.safeLoad(fs.readFileSync(process.cwd() +'/hyperstatic.yml', 'utf8'));
} catch (e) {
  console.log('Yaml file not found, or malformed. Aborting.')
  console.log(e);
  process.exit();
}

function withConfig(param) {
  return `${process.cwd()}/${CONFIG_OBJECT[param]}`
}


// BUILD TASK
gulp.task('inline',  (done) => {
  // Do not inline files
  const NO_INLINE  = CONFIG_OBJECT.do_not_inline.map(file =>  `/${file}`)
  glob(process.cwd() + '/_build' + '/**/*.html', (err, files) => {
     if (err) return done(err);
     let tasks = files.map(file => {
       return gulp.src(file)
       .pipe(inline({
         base: process.cwd() + '/_build',
         js: uglify,
         css: [minifyCss, autoprefixer({ browsers:['last 2 versions'] })],
         ignore: NO_INLINE
       }))
       //.pipe(htmlmin({collapseWhitespace: true}))
       .pipe(gulp.dest('./dist'));
     });
     eventStream.merge(tasks).on('end', done);
 });
})

// Remove
gulp.task('public', () => {
    return gulp.src(`${withConfig('public_folder')}/**/*.*`)
      .pipe(imagemin())
      .pipe(gulp.dest('./_build'))
});

// Copy Ignored files
gulp.task('copy-public', () => {
    return gulp.src(`${withConfig('public_folder')}/**/*.*`)
      .pipe(imagemin())
      .pipe(gulp.dest('./dist'))
});



gulp.task('clean-dist', (cb) => {
  rimraf('./dist', cb)
})



gulp.task('default', runSequence('clean-dist','copy-public', 'public', 'inline' ))
