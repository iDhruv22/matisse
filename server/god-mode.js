/**
 * Helps in viewing the active boards and users.  Stats.js page
   connects to 'godio' socket to get the active boards and users.
 */

module.exports = {
    enable : function(app, io, redis) {

        var activeBoards = [];

        function findBoard(name) {
            for(var i = 0; i < activeBoards.length; i++) {
                if(activeBoards[i].name == name) {
                    return activeBoards[i];
                }
            }
            var board = {name: name, users: []};
            activeBoards.push(board);
            return board;
        }

        function addUser(board, user) {
            if(board.users.indexOf(user) < 0) {
                board.users.push(user);
            }
        }

        function removeUser(board, user) {
            board.users.splice(board.users.indexOf(user), 1);
            if(board.users.length == 0) {
                activeBoards.splice(activeBoards.indexOf(board), 1);
            }
        }

        function onHello(name) {
            var boardNew = this.board;
            addUser(findBoard(boardNew), name);
            boardcastActiveBoards();

        }

        function onBye() {
            var s = this;
            var u = this.name;
            var b = this.board;
            removeUser(findBoard(b), u);
            boardcastActiveBoards();
        }

        io.sockets.on('connection',
                      function (sock) {
                          sock.on('hello', onHello);
                          sock.on('disconnect', onBye);
                      });

        var godio = io.of('/god')
            .on('connection',
                function (sock) {
                    sock.emit('active-boards', activeBoards);
                });

        function boardcastActiveBoards() {
            godio.emit('active-boards', activeBoards);
        }

        letGodsBeInvisible(godp(redis));
        onlyGodsCanViewStats(app, godp(redis));
    }
};

/** Returns an isGod function which takes a user name and call fn with
 *  whether god is true or not
 */
function godp(redis) {
    return function(name, fn) {
        redis.sismember('matisse:gods', name,
                        function(err, i) { // i == 1 is god
                            fn(i == 1);
                        });
    };
}

/**
 * God users, when joining a board, should not disturb other users.
 * No 'hello's... don't emit that event.
 */
function letGodsBeInvisible (isGod) {
    var collaboration = require('./collaboration');

    collaboration.events.hello =
        (function (originalHello) {
             return function(name) {
                 var sock = this;
                 isGod(name, function(yes) {
                           if(!yes) {
                              originalHello.call(sock, name);
                           }
                       });
             };
         })(collaboration.events.hello);
}

/**
 * Send unauthorized status for non-god users
 */
function onlyGodsCanViewStats(app, isGod) {
    var User = require('../models/UserModel');

    app.get('/internal/stats.html',
            function (req, res, next) {
                var auth = req.session.auth;
                if(!auth) {
                    res.send("Unauthorized", 403);
                } else {
                    isGod(new User().getUserFromSession(auth).name,
                          function(yes) {
                              if(yes) {
                                  next();
                              } else {
                                  res.send("Unauthorized", 403);
                              }
                          });
                }
            });
}
