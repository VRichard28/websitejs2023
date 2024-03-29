"use strict";
const gulp = require("gulp");
// Load plugin
const sass = require("gulp-sass")(require("node-sass"));
var rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css'); 
var minify = require('gulp-minify');
var concat = require('gulp-concat');



// ca sa transformam fisiere sass/scss in fisiere css: gulp sass
function sasstocss() {
  return gulp
    .src("dev/scss/style.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("dev/css"));
}

// ca sa optimizam fisierele css : gulp css
function csstomin () {
  return gulp
    .src("dev/css/style.css")

    .pipe(
      cleanCSS({ debug: true }, (details) => {
        console.log(`${details.name}: ${details.stats.originalSize}`);
        console.log(`${details.name}: ${details.stats.minifiedSize}`);
      }),
    )
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(gulp.dest("assets/css/"));
}
// ca sa optimizam fisierele js : gulp css
function jstomin(){    
  return gulp.src(['dev/js/*'])
      .pipe(concat('main.js'))
      //.pipe(gulp.dest('dev/js'))
      .pipe(minify())
      .pipe(gulp.dest('assets/js'));
}

// genereaza in mod automat fisierul css la modificarile diin fisierele scss
function watch_scss() {
  return gulp.watch(['dev/scss/style.scss'], gulp.series(sasstocss,csstomin));
}
function watch_js() {
  return gulp.watch(['dev/js/*'], gulp.series(jstomin));
}
exports.buildcss = gulp.series(watch_scss);
exports.buildjs = gulp.series(watch_js);
// optional pentru imagini : gulp images
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageResize = require('gulp-image-resize');
const webp = require('gulp-webp');

gulp.task('images', () => {
  
//   specificam dimensiunea imaginilor
  const sizes = [
    { width: 576, quality: 70, suffix: 'small' },
    { width: 768, quality: 80, suffix: 'medium' },
    { width: 992, quality: 100, suffix: 'large' },
  ];
  let stream;
  sizes.forEach((size) => {
    stream = gulp
//     calea catre imaginile pe care le dorim sa le optimizam
      //.src('assets/img/slide2.png')
      .src('assets/images/*')  // recursiv in toate subfolderele
      // daca apare o eroare nu se opreste si sare peste
      //.pipe(plumber())
//     resize image
      .pipe(imageResize({ width: size.width }))
//       add suffix to image
      .pipe(
        rename((path) => {
          path.basename += `-${size.suffix}`;
        }),
      )
//     reduce image quality based on the size
      .pipe(
        imagemin(
          [
            imageminMozjpeg({
              quality: size.quality,
            }),
          ],
          {
            verbose: true,
          },
        ),
      )
//     output optimized images to a destination folder
      .pipe(gulp.dest('assets/img'));
  });
  return stream;
});



gulp.task('imagestowebp', () => {

	gulp.src('assets/img/*.{png,jpeg,jpg}')
		.pipe(webp())
		.pipe(gulp.dest('assets/img'))
});

function watch_img() {
  return gulp.watch(['assets/images'], gulp.series('images','imagestowebp'));
}
exports.buildwebp = gulp.series(watch_img);