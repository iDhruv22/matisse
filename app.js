var noop = function() {}
  /**
   * Module dependencies.
   */
application = (function() {
  var express = require('express');
  var Resource = require('express-resource');
  var routes = require('./routes');
  var everyauth = require('everyauth');
  var collaboration = require('./server/collaboration');
  var login = require('./server/login');
  var bodyParser = require('body-parser');
  var cookieParser = require('cookie-parser');
  var session = require('express-session');
  var methodOverride = require('method-override');
  var morgan = require('morgan');
  var errorhandler = require('errorhandler');
  var favicon = require('serve-favicon');
  var path = require('path');
  var http = require('http');

  //compress the static content
  //var gzippo = require('gzippo');

  var Nohm = require('nohm').Nohm;
  var BoardModel = require(__dirname + '/models/BoardModel.js');
  var ShapesModel = require(__dirname + '/models/ShapesModel.js');
  var UserModel = require(__dirname + '/models/UserModel.js');
  var redis = require("redis");
  var redisClient = redis.createClient(); //go thru redis readme for anyother config other than default: localhost 6379
  var logFile = null;
  var fs = require('fs');
  var LogToFile = require("./server/logToFile");

  redisClient.select(4);
  Nohm.setPrefix('matisse'); //setting up app prefix for redis
  Nohm.setClient(redisClient);

  login.authenticate();
  //logging
  Nohm.logError = function(err) {
    if (err) {
      console.log("===============Nohm Error=======================");
      console.log(err);
      console.log("======================================");
    }
  };

  redisClient.on("error", function(err) {
    console.log("Error %s", err);
  });

  var app = express();
  var server = http.createServer(app);
  var io = require('socket.io').listen(server);

  // var configure = function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(cookieParser());
  app.use(session({
    secret: 'foobar',
    saveUninitialized: true,
    resave: true
  }));
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.use(everyauth.middleware());
  app.use(methodOverride());
  // app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  //everyauth.helpExpress(app);
  // };

  var setEnvironmentSettings = function(env) {
    var expressErrorHandlerOptions = {};
    switch (env) {
      case 'development':
        expressErrorHandlerOptions = {
          dumpExceptions: true,
          showStack: true
        };
        LogToFile.start();
        break;
      case 'production':
        break;
      default:
        break;
    }
    app.use(errorhandler(expressErrorHandlerOptions));
  };

  var use = function(err, req, res, next) {
      if (err instanceof Error) {
        err = err.message;
      }
      res.json({
        result: 'error',
        data: err
      });
    }
    // Configuration
    // app.set(configure);

  if ('production' == app.get('env')) {
    setEnvironmentSettings('production');
  } else {
    setEnvironmentSettings('development');
  }

  //   app.configure('development', function() { setEnvironmentSettings('development') });
  //   app.configure('production', function() { setEnvironmentSettings('production') });

  // Routes
  app.get('/', routes.index);
  // app.get('/favicon', exports.favicon);
  app.get('/boards', routes.boards.index);
  app.resource('api', routes.api);
  app.post('/boards', routes.boards.index);
  app.post('/boards/update', routes.boards.update);
  app.post('/remove', routes.boards.remove);
  app.get('/about', function(req, res, next) {
    res.sendFile(__dirname + '/about.html');
  });
  app.get('/userinfo', routes.userinfo);

  var logErrorOrExecute = function(err, param, callback) {
    if (err) {
      console.log(err);
    } else {
      if (callback) {
        console.log(param);
        callback(param);
      }
    }
  };

  var redirectToHome = function(req, res) {
    res.writeHead(302, {
      'Location': 'http://' + req.headers.host
    });
    if (req.session) {
      req.session.redirectPath = req.url;
    }
    res.end();
  };

  app.resource('boards', {
    show: function(req, res, next) {
      console.log('sdfsdf');
      if (req.loggedIn) {
        if (req.params.id != "favicon") {
          var whiteBoard = new BoardModel();
          whiteBoard.find({ url: req.params.board.replace(/[^a-zA-Z 0-9]+/g, '') }, function(err, ids) {
            if (err) {
              redirectToHome(req, res);
            } else {
              if (ids && ids.length != 0) {
                var session_data = req.session.auth;
                var userObj = new UserModel();
                var userID = userObj.getUserID(session_data);
                var userName = userObj.getUserFromSession(session_data).name;
                whiteBoard.load(ids[0], function(id) {});
                UserModel.find({ userID: userID }, function(err, ids) {
                  if (err) {} else {
                    var user = new UserModel;
                    user.load(ids[0], function(err, props) {
                      if (err) {
                        return err;
                      }
                      user.belongsTo(whiteBoard, 'ownedBoard', function(err, relExists) {
                        if (relExists) {} else {
                          if (whiteBoard.property('createdBy') == "") whiteBoard.property('createdBy', userName);
                          user.link(whiteBoard, 'sharedBoard');
                          whiteBoard.link(user, 'userShared');
                          user.save(noop);
                          whiteBoard.save(noop);
                        }
                      });
                    });
                  }
                });
                res.sendFile(__dirname + '/board.html');
              } else {
                redirectToHome(req, res);
              }
            }
          });
        }
      } else {
        redirectToHome(req, res);
      }
    }
  });

  app.use(use);

  var listener = server.listen(8000, function() {
    console.log("Matisse server listening on port %d in %s mode", listener.address().port, app.settings.env);
  });

  io.configure('production', function() {
    io.set('transports', ['xhr-polling']);
  });
  io.set('log level', 2);

  UserModel.find(function(err, userIds) {
    if (err) {
      console.log("***Error in finding users***" + err);
    } else {
      userIds.forEach(function(userid) {
        var user = new UserModel();
        user.load(userid, function(err, props) {
          user.getAll('Board', 'sharedBoard', function(err, ids) {
            console.log("shared");
            console.log(ids);
            if (!err) {
              ids.forEach(function(id) {
                var board = new BoardModel();
                board.load(id, function(err, props) {
                  console.log(id);
                  console.log("---------");
                  board.link(user, 'userShared');
                  board.save(noop);
                });
              });
            } else {
              console.log("***Error in unlinking sharedBoard from other users***" + err);
            }
          });

          user.getAll('Board', 'ownedBoard', function(err, bids) {
            console.log("owned");
            console.log(bids);
            if (!err) {
              bids.forEach(function(bid) {
                var sboard = new BoardModel();
                sboard.load(bid, function(err, props) {
                  sboard.link(user, 'userOwned');
                  sboard.save(noop);
                });
              });
            } else {
              console.log("***Error in linking ownedBoard from other users***" + err);
            }
          });

        });
      });
    }
  });

  logFile = fs.createWriteStream('./app.log', { flags: 'a' });
  app.use(morgan('combined', { stream: logFile }));

  collaboration.collaborate(io);

  require('./server/god-mode').enable(app, io, redisClient);
}).call(this);