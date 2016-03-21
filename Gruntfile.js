module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            development: {
                options: {
                    compress: false,
                    yuicompress: false,
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },
                files: {
                    "dist/css/scs.css": "src/less/scs.less",
                    "dist/css/layout.css": "src/less/layout.less"
                }
            },
            production: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2,
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },
                files: {
                    "dist/css/scs.min.css": "src/less/scs.less",
                    "dist/css/layout.min.css": "src/less/layout.less"
                }
            }
        },
        uglify: {  
            production: {
                options: {
                    mangle: true 
                },
                files: {
                    'dist/js/jquery.scs.min.js': 'src/js/jquery.scs.js',
                    'dist/js/CNAddrArr.min.js': 'src/js/CNAddrArr.js'
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            grunt: {
                files: ['Gruntfile.js']
            },

            styles: {
                files: [
                        'src/less/*.less',
                        'src/less/**/*.less',
                        'src/less/***/**/*.less',
                        'dist/css/*.css',
                        'dist/css/**/*.css',
                        'dist/css/***/**/*.css'
                ],
                tasks: [
                        'less'
                ],
                options: {
                    nospawn: true
                }
            },
            js: {
                files: ['src/js/*.js', 'src/js/**/*.js'],
                tasks: ['uglify']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['watch']);
};
