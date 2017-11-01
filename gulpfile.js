const gulp          = require('gulp')
const browserSync   = require('browser-sync').create()
const sass          = require('gulp-sass')
const concat        = require('gulp-concat')
const nunjucks      = require('gulp-nunjucks-html')
const fs            = require('fs')
const path          = require('path')
var gulpWebpack     = require('gulp-webpack');
const webpack       = require('webpack')
const yaml          = require('js-yaml')
const runSequence = require('gulp-sequence')
const rimraf       = require('rimraf')

// Get document, or throw exception on error
let CONFIG_OBJECT = {};

gulp.task('clean-build', (cb) => {
  rimraf('./_build', cb)
})

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

let webpackConfig = module.exports = {
    entry: `/${withConfig('js_folder')}/${CONFIG_OBJECT.webpack_entry_file}`,
    output: {
        path: process.cwd() + '/_build',
        filename: CONFIG_OBJECT.js_filename
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
            { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ }
        ]
    },
}

const JS_TASK = CONFIG_OBJECT.webpack ? 'webpack' : 'js'


// Static Server + watching scss/html files
gulp.task('serve', ['sass', JS_TASK, 'nunjucks'], () => {
  browserSync.init({
    server: ["./_build", CONFIG_OBJECT.public_folder]
  });
  gulp.watch(`${withConfig('sass_folder')}/**/*.scss`, ['sass']);
  gulp.watch(`${withConfig('js_folder')}/**/*.js`, [JS_TASK]);
  gulp.watch(`${withConfig('nunjucks_folder')}/**/*.js`, ['nunjucks']).on('change', ()=> {
    setTimeout(()=> {
      browserSync.reload();
    }, CONFIG_OBJECT.reload_delay)
  });
});

gulp.task('sass', () => {
  return gulp.src(`${withConfig('sass_folder')}/**/*.scss`)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest("./_build"))
    .pipe(browserSync.stream());
})

gulp.task('webpack', () => {
  return gulp.src(`${withConfig('js_folder')}/${CONFIG_OBJECT.webpack_entry_file}`)
    .pipe(gulpWebpack(webpackConfig, webpack))
    .pipe(gulp.dest("./_build"))
    .pipe(browserSync.stream());
})

gulp.task('js', () => {
  return gulp.src(`${withConfig('js_folder')}/**/*.js`)
    .pipe(concat(CONFIG_OBJECT.js_filename))  
    .pipe(gulp.dest("./_build"))
    .pipe(browserSync.stream());
})

gulp.task('nunjucks', function() {
  return gulp.src([`${withConfig('nunjucks_folder')}/**/*.html`, '!**/_*/**'])
    .pipe(nunjucks({searchPaths: [ withConfig('nunjucks_folder') ], locals: CONFIG_OBJECT})).on('error', function(err) {
      console.log('Nunjucks error', err)
    })
    .pipe(gulp.dest('./_build'));
});

gulp.task('clean-build', (cb) => {
  rimraf('./_build', cb)
})

gulp.task('default', runSequence('clean-build', 'serve'));
gulp.task('prepare', runSequence('clean-build', 'sass', JS_TASK, 'nunjucks'));

