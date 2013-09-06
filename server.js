/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    settings = require('./settings.js'),
    appName = settings.appName,
    UserProvider = require('./server/api/userprovider').UserProvider,
    BoardProvider = require('./server/api/boardprovider').BoardProvider,
    serverPort = settings.serverPort;

var app = express();

// all environments
app.set('port', process.env.PORT || serverPort);

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

var baseDir = __dirname + '/client/';

// development only
if ('production' == app.get('env')) {
    app.use(express.static(path.join(__dirname, 'dist')));
} else {
    app.use(express.static(path.join(__dirname, 'client')));
    app.use(express.errorHandler());
}


app.get('/', function (request, response) {
    response.sendfile(baseDir + 'index.html');
});

app.post('/logout', function (request, response) {
    response.clearCookie('auth');
    response.end();
});

app.post('/authenticate', function (request, response) {
    var email = request.param('email');
    var password = request.param('password');
    var isCookieActive = false;
    if (email == null) {
        var cookies = {};
        request.headers.cookie && request.headers.cookie.split(';').forEach(function (cookie) {
            var parts = cookie.split('=');
            cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
            console.log(parts[1].trim().toString());
            if (parts[0] == "auth") {
                email = decodeURIComponent(parts[1]);
                isCookieActive = true;
            }
        });

    }
    userProvider.findByEmail(email, function (error, emps) {
        if (isCookieActive || (emps && emps.hasOwnProperty('email') && emps['email'] && emps['password'] == password)) {
            response.cookie('auth', emps['email'], { maxAge:5*60*1000, httpOnly:true });//maxAge in milliseconds
            response.send('200', {
                success:"Login Successful",
                user:emps['user'],
                createdNum:emps['createdNum'],
                sharedNum:emps['sharedNum']
            });
        } else {
            response.send(401, {error:"Invalid username or password"});
        }
    });
});

var boardProvider = new BoardProvider('localhost', 27017);

app.get('/board/new', function (req, res) {

    var chars = "0123456789abcdefghiklmnopqrstuvwxyz";
    var string_length = 8;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    if (req.param('email') != undefined) {
        boardProvider.save({
            email:req.param('email'),
            createdUrl:randomstring,
            sharedUrl:null
        }, function (error, docs) {
            Object.keys(docs).forEach(function (key) {
                console.log("test: " + key, docs[key]);
            });
            if (docs && docs.hasOwnProperty('email') && docs['email']) {
                response.send('200', {
                    success:"Created Successful",
                    user:docs['user'],
                    createdUrl:docs['createdUrl'],
                    sharedUrl:docs['sharedUrl']
                });
            } else {
                response.send(401, {error:"unable to create whiteboard for the username " + req.param('email')});
            }

        });
    }
});
app.get('/board/:id/share', function (req, res) {
    if (req.param('email') != undefined) {
        boardProvider.save({
            email:req.param('email'),
            createdUrl:null,
            sharedUrl:req.param('_id')
        }, function (error, docs) {
            Object.keys(docs).forEach(function (key) {
                console.log("test: " + key, docs[key]);
            });

            if (docs && docs.hasOwnProperty('email') && docs['email']) {
                response.send('200', {
                    success:"Shared Successful",
                    user:docs['user'],
                    createdUrl:docs['createdUrl'],
                    sharedUrl:docs['sharedUrl']
                });
            } else {
                response.send(401, {error:"unable to Share whiteboard for the username " + req.param('email')});
            }

        });
    }
});
var userProvider = new UserProvider('localhost', 27017);

app.get('/initdb', function (req, res) {
    userProvider.save({
        email:'admin@pramati.com',
        password:'pramati123',
        user:'admin',
        createdNum:2,
        sharedNum:5
    }, function (error, docs) {
        Object.keys(docs).forEach(function (key) {
            console.log("test: " + key, docs[key]);
        });
//        res.redirect('/')
    });
    userProvider.save({
        email:'user@pramati.com',
        password:'pramati123',
        user:'user',
        createdNum:3,
        sharedNum:8
    }, function (error, docs) {
        Object.keys(docs).forEach(function (key) {
            console.log("test: " + key, docs[key]);
        });
//        res.redirect('/')
    });
    userProvider.save({
        email:'user1@pramati.com',
        password:'pramati123',
        user:'user1',
        createdNum:1,
        sharedNum:9
    }, function (error, docs) {
        Object.keys(docs).forEach(function (key) {
            console.log("test: " + key, docs[key]);
        });
//        res.redirect('/')
    });
});
//Routes
//index
app.get('/user', function (req, res) {
    userProvider.findAll(function (error, emps) {
        var obj = {
            email:'User',
            user:emps
        };
        // Visit non-inherited enumerable keys
            Object.keys(emps).forEach(function (key) {
                console.log("test: " + key, emps[key]);
            });
        res.send('index', {
            email:'User',
            user:emps
        });
    });
});

//new user
app.get('/user/new', function (req, res) {
    res.send('user_new', {
        user:'New User'
    });
});

//save new user
app.post('/user/new', function (req, res) {
    userProvider.save({
        email:req.param('email'),
        password:req.param('password'),
        user:req.param('user'),
        createdNum:req.param('createdNum'),
        sharedNum:req.param('sharedNum')
    }, function (error, docs) {
        res.redirect('/')
    });
});

//update an user
app.get('/user/:id/edit', function (req, res) {
    userProvider.findById(req.param('_id'), function (error, user) {
        res.send('user_edit',
            {
                email:user.email,
                user:user
            });
    });
});

//save updated user
app.post('/user/:id/edit', function (req, res) {
    userProvider.update(req.param('_id'), {
        email:req.param('email'),
        password:req.param('password'),
        user:req.param('user'),
        createdNum:req.param('createdNum'),
        sharedNum:req.param('sharedNum')
    }, function (error, docs) {
        res.redirect('/')
    });
});

//delete an user
app.post('/user/:id/delete', function (req, res) {
    userProvider.delete(req.param('_id'), function (error, docs) {
        res.redirect('/')
    });
});


app.listen(serverPort);
console.log("%s Server listening on port %d in %s mode, started on %s", appName, serverPort, app.settings.env, new Date());