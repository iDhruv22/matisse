'use strict';
var settings = require('./settings.js');
module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        app:'client',
        dist:'client'
    };

    try {
        yeomanConfig.app = require('./component.json').appPath || yeomanConfig.app;
    } catch (e) {
    }

    grunt.initConfig({
        yeoman:yeomanConfig,
        app:{
            lessSrc:'./client/less',
            bootstrapSrc:'./client/public/lib/bootstrap/css/',
            cssDest:'./client/public/css'
        },
        bgShell:{
            mongo:{
                cmd:'mongod',
                bg:true
            }
        },
        express:{
            options:{
                port:process.env.PORT
            },
            dev:{
                options:{
                    script:'server.js'
                }
            },
            prod:{
                options:{
                    script:'server.js'
                }
            }
        },
        recess:{
            options:{
                compile:true
            },
            dist:{
                files:{
                    '<%= app.cssDest %>/matisse.css':[
                        '<%= app.lessSrc %>/*.less'/*,
                         '<%= app.bootstrapSrc %>/bootstrap.css',
                         '<%= app.bootstrapSrc %>/bootstrap-responsive.css'*/
                    ]
                }
            }
        },
        watch:{
            coffee:{
                files:['<%= yeoman.app %>/js/{,*/}*.coffee'],
                tasks:['coffee:dist']
            },
            coffeeTest:{
                files:['test/spec/{,*/}*.coffee'],
                tasks:['coffee:test']
            },
            styles:{
                files:'<%= app.lessSrc %>/*.less',
                tasks:['recess']
            },
            compass:{
                files:['<%= yeoman.app %>/css/{,*/}*.{scss,sass}'],
                tasks:['compass']
            },
            express:{
                files:[
                    '<%= yeoman.app %>/{,*//*}*.html',
                    '{.tmp,<%= yeoman.app %>}/css/{,*//*}*.css',
                    '{.tmp,<%= yeoman.app %>}/js/{,*//*}*.js',
                    '<%= yeoman.app %>/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}',
                    'server.js',
                    'server/{,*//*}*.{js,json}'
                ],
                tasks:['express:dev'],
                options:{
                    livereload:true,
                    nospawn:true //Without this option specified express won't be reloaded
                }
            }
        },
        open:{
            server:{
                url:'http://localhost:<%= express.options.port %>'
            }
        },
        clean:{
            dist:{
                files:[
                    {
                        dot:true,
                        src:[
                            '.tmp',
                            '<%= yeoman.dist %>/*',
                            '!<%= yeoman.dist %>/.git*'
                        ]
                    }
                ]
            },
            server:'.tmp'
        },
        jshint:{
            options:{
                jshintrc:'.jshintrc'
            },
            all:[
                'Gruntfile.js',
                '<%= yeoman.app %>/js/{,*/}*.js'
            ]
        },
        karma:{
            unit:{
                configFile:'karma.conf.js',
                singleRun:true
            }
        },
        coffee:{
            dist:{
                files:[
                    {
                        expand:true,
                        cwd:'<%= yeoman.app %>/js',
                        src:'{,*/}*.coffee',
                        dest:'.tmp/js',
                        ext:'.js'
                    }
                ]
            },
            test:{
                files:[
                    {
                        expand:true,
                        cwd:'test/spec',
                        src:'{,*/}*.coffee',
                        dest:'.tmp/spec',
                        ext:'.js'
                    }
                ]
            }
        },
        compass:{
            options:{
                sassDir:'<%= yeoman.app %>/css',
                cssDir:'.tmp/styles',
                imagesDir:'<%= yeoman.app %>/images',
                javascriptsDir:'<%= yeoman.app %>/js',
                fontsDir:'<%= yeoman.app %>/styles/fonts',
//                importPath: '<%= yeoman.app %>/components',
                relativeAssets:true
            },
            dist:{},
            server:{
                options:{
                    debugInfo:true
                }
            }
        },
        concat:{
            dist:{
                files:{
                    '<%= yeoman.dist %>/js/scripts.js':[
                        '.tmp/js/{,*/}*.js',
                        '<%= yeoman.app %>/js/{,*/}*.js'
                    ]
                }
            }
        },
        useminPrepare:{
            html:'<%= yeoman.app %>/index.html',
            options:{
                dest:'<%= yeoman.dist %>'
            }
        },
        usemin:{
            html:['<%= yeoman.dist %>/{,*/}*.html'],
            css:['<%= yeoman.dist %>/css/{,*/}*.css'],
            options:{
                dirs:['<%= yeoman.dist %>']
            }
        },
        imagemin:{
            dist:{
                files:[
                    {
                        expand:true,
                        cwd:'<%= yeoman.app %>/images',
                        src:'{,*/}*.{png,jpg,jpeg}',
                        dest:'<%= yeoman.dist %>/images'
                    }
                ]
            }
        },
        cssmin:{
            dist:{
                files:{
                    '<%= yeoman.dist %>/css/main.css':[
                        '.tmp/css/{,*/}*.css',
                        '<%= yeoman.app %>/css/{,*/}*.css'
                    ]
                }
            }
        },
        htmlmin:{
            dist:{
                options:{
                    /*removeCommentsFromCDATA: true,
                     // https://github.com/yeoman/grunt-usemin/issues/44
                     //collapseWhitespace: true,
                     collapseBooleanAttributes: true,
                     removeAttributeQuotes: true,
                     removeRedundantAttributes: true,
                     useShortDoctype: true,
                     removeEmptyAttributes: true,
                     removeOptionalTags: true*/
                },
                files:[
                    {
                        expand:true,
                        cwd:'<%= yeoman.app %>',
                        src:['*.html', 'views/*.html'],
                        dest:'<%= yeoman.dist %>'
                    }
                ]
            }
        },
        cdnify:{
            dist:{
                html:['<%= yeoman.dist %>/*.html']
            }
        },
        ngmin:{
            dist:{
                files:[
                    {
                        expand:true,
                        cwd:'<%= yeoman.dist %>/js',
                        src:'*.js',
                        dest:'<%= yeoman.dist %>/js'
                    }
                ]
            }
        },
        uglify:{
            dist:{
                files:{
                    '<%= yeoman.dist %>/js/scripts.js':[
                        '<%= yeoman.dist %>/js/scripts.js'
                    ]
                }
            }
        },
        rev:{
            dist:{
                files:{
                    src:[
                        '<%= yeoman.dist %>/js/{,*/}*.js',
                        '<%= yeoman.dist %>/css/{,*/}*.css',
                        '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%= yeoman.dist %>/styles/fonts/*'
                    ]
                }
            }
        },
        copy:{
            dist:{
                files:[
                    {
                        expand:true,
                        dot:true,
                        cwd:'<%= yeoman.app %>',
                        dest:'<%= yeoman.dist %>',
                        src:[
                            '*.{ico,txt}',
                            '.htaccess',
                            'components/**/*',
                            'images/{,*/}*.{gif,webp}',
                            'styles/fonts/*'
                        ]
                    }
                ]
            },
            css:{
                files:[
                    {
                        expand:true,
                        cwd:'<%= app.src %>',
                        src:['**/*.css'],
                        dest:'<%= app.dist %>'
                    }
                ]
            }
        }
    });

    grunt.registerTask('server', [
        'bgShell:mongo',
        'clean:server',
        'coffee:dist',
        'recess',
        'compass:server',
        'express:dev',
        'open',
        'watch'
    ]);

    grunt.registerTask('test', [
        'clean:server',
        'coffee',
        'compass',
        'karma'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'jshint',
        'test',
        'coffee',
        'recess',
        'compass:dist',
        'useminPrepare',
        'imagemin',
        'cssmin',
        'htmlmin',
        'concat',
        'copy',
        'cdnify',
        'ngmin',
        'uglify',
        'rev',
        'usemin'
    ]);

    grunt.registerTask('default', ['build']);

};