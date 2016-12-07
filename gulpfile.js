const gulp = require('gulp');
// 载入所有以gulp为前缀的插件
const $ = require('gulp-load-plugins')();
const revCollector = require('gulp-rev-collector');
const clean = require('gulp-clean');

gulp.task('clean', () => {
    console.log('clean');
    return gulp.src('dist/')
        .pipe(clean());
});

gulp.task('babelES6', () => { // 执行babelES6之前clean一下
    return gulp.src('es6/*.js')
        .pipe($.babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist/es5/')); // 将rev-manifest.json保存到rev目录里
});

gulp.task('md5js', ['babelES6'], () => {
    return gulp.src('dist/es5/*.js')
        .pipe($.rev())
        .pipe(gulp.dest('dist/es5/'))
        .pipe($.rev.manifest()) // 生成一个rev-manifest.json
        .pipe(gulp.dest('dist/rev/scripts'));
});

gulp.task('watchBabel', () => {
    gulp.watch('es6/*.js', ['babelES6']); // 当文件发生改变时，执行babelES6任务
});

gulp.task('lessCompile', () => {
    return gulp.src('less/*.less')
        .pipe($.less())
        .pipe(gulp.dest('dist/css/'));
});

gulp.task('watchLess', function () {
    gulp.watch('less/*.less', ['lessCompile']);
});

gulp.task('md5css', ['lessCompile'], function () {
    return gulp.src('dist/css/*.css')
        .pipe($.rev())
        .pipe(gulp.dest('dist/css/'))
        .pipe($.rev.manifest())
        .pipe(gulp.dest('dist/rev/css'));
});

// 替换html里的引用路径为md5加密后的js/css
gulp.task('replaceHtml', ['md5js', 'md5css'], () => { // 执行完babelES6和lessCompile以后再执行replaceHtml
    return gulp.src(['dist/rev/**/*.json', './index.html']) // 获取rev-manifest和要替换的html
        //根据rev-manifest.json的规则替换html里的路径，由于替换是根据rev-manifest.json规则来的，所以一定要先生成这个文件再进行替换
        .pipe(revCollector())
        .pipe(gulp.dest('./'));
});

gulp.task('help', () => {
    console.log('gulp default/gulp命令：生成编译文件');
    console.log('gulp clean命令：删除生成的dist目录');
    console.log('gulp replaceHtml命令：md5加密js/css，并替换到html引用里');
});

gulp.task('default', ['babelES6', 'lessCompile','watchBabel', 'watchLess'], () => {
    console.log('目录文件已生成，可以进行开发了！');
});
