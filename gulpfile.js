var gulp=require('gulp')
var gutil = require('gulp-util')
var uglify = require('gulp-uglify')
var rev=require('gulp-rev')
var revCollector = require('gulp-rev-collector');
var cleanCSS = require('gulp-clean-css')
var imagemin = require('gulp-imagemin')
var sourcemaps = require('gulp-sourcemaps')
var combiner = require('stream-combiner2')

var assetRev = require('gulp-asset-rev') //改变图片路径

var srcFolder='src'
var destFolder='dist'

var handleError = function (err) {
    var colors = gutil.colors;
    console.log('\n')
    gutil.log(colors.red('Error!'))
    gutil.log('fileName: ' + colors.red(err.fileName))
    gutil.log('lineNumber: ' + colors.red(err.lineNumber))
    gutil.log('message: ' + err.message)
    gutil.log('plugin: ' + colors.yellow(err.plugin))
}
gulp.task('css', function() {
    return gulp.src(srcFolder+'/css/*.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(sourcemaps.write('./'))
        .pipe(rev())
        .pipe(gulp.dest(destFolder+'/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/css'));
});
gulp.task('js', function() {
    var combined = combiner.obj([
        gulp.src(srcFolder+'/js/*.js'),
        sourcemaps.init(),
        uglify(),
        sourcemaps.write('./'),
        rev(),
        gulp.dest(destFolder+'/js'),
        rev.manifest(),
        gulp.dest('rev/js')
    ])
    combined.on('error', handleError)
});
gulp.task('image', function () {
    gulp.src(srcFolder+'/images/**/*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest(destFolder+'/images'))
})
gulp.task('assetRev',['image'], function() {

    return gulp.src(destFolder+'/images/**/*') // 该任务针对的文件

        .pipe(assetRev()) // 该任务调用的模块

        .pipe(gulp.dest(destFolder+'/images')); // 编译后的路径

});


gulp.task('rev', ['css','js'],function() {
    return gulp.src(['rev/**/*.json', srcFolder+'/html/*.html'])
        .pipe(revCollector({
            replaceReved: true,//允许替换, 已经被替换过的文件
            dirReplacements: {
                'css': 'css',
                'js': 'js'
            }
        }))
        .pipe(gulp.dest(destFolder+'/html'))
        .pipe(assetRev())
        .pipe(gulp.dest(destFolder+'/html'));
});


gulp.task('default',['rev','assetRev']);