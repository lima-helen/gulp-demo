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

var runSequence=require('run-sequence')

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
    return gulp.src(srcFolder+'/img/**/*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest(destFolder+'/img'))

})


gulp.task('imageRevHtml',function(){
    return gulp.src(destFolder+'/*.html')
        .pipe(assetRev())
        .pipe(gulp.dest(destFolder));
})

gulp.task('rev', ['css','js'],function() {
    return gulp.src(['rev/**/*.json', srcFolder+'/*.html'])
        .pipe(revCollector({
            replaceReved: true,//允许替换, 已经被替换过的文件
            dirReplacements: {
                'css': 'css',
                'js': 'js'
            }
        }))
        .pipe(gulp.dest(destFolder))

});

gulp.task('default',function(done){
    condition=false;
    runSequence(
        [ 'rev' ],
        [ 'image' ],
        [ 'imageRevHtml' ],
        done)

})
// gulp.task('default',['rev','image','imageRevHtml']);
