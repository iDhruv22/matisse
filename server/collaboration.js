collaboration = module.exports = {
	boardModel: require(__dirname + '/../models/BoardModel.js'),
	shapesModel: require(__dirname + '/../models/ShapesModel.js'),
	events: {
		setUrl: function (location, data) {
			var socket = this;
			var wb_url = location.replace("/", "");
			var randomnString = wb_url.substr(wb_url.indexOf('/') + 1);
			socket.join(wb_url);
                        socket.board = wb_url;
                        socket.emit('joined');

			writeBoardModels(randomnString, socket);
			writeShapeModels(wb_url, socket);
		},
		setContainer: function (location, data) {
			console.log("location: "+location);
			var wb_url = location.replace("/", "");
			console.log("wb_url: "+wb_url);
			var randomnString = wb_url.substr(wb_url.indexOf('/') + 1);
			console.log("randomnString: "+randomnString);
			findInBoardModelforSetContainer(randomnString, wb_url, data);
		},
		eventDraw: function (location, data) {
			var socket = this;
			var url = location.replace("/", "");
			drawOnBoard(url, data, socket);
		},
                hello: function (name) { // user joins say hello to all
                    var s = this;
                    s.name= name;
                    var boardData = s.board;
										s.broadcast.to(boardData).emit('hello',name);
                },
                bye: function () { // user left say bye to all
                    var s = this;
										var name = s.name;
										var boardData = s.board;
                    s.broadcast.to(boardData).emit('bye',name);
                }
	},
	collaborate: function (io) {
		var thisObj = this;
		io.sockets.on('connection', function (socket) {
			//var setUrl = thisObj.events["setUrl"];
			socket.emit('eventConnect', {
				message: 'welcome'
			});

			socket.on("setUrl", thisObj.events["setUrl"]);
			socket.on("setContainer", thisObj.events["setContainer"]);
			socket.on('eventDraw', thisObj.events["eventDraw"]);
                        socket.on('hello', thisObj.events['hello']);
                        socket.on('disconnect', thisObj.events['bye']);
		});
	}
}

var writeBoardModels = function(randomStr, socket) {
	var BoardModel = collaboration.boardModel;
	BoardModel.find({url:randomStr},function (err, ids) {
		if (err) {
			console.log(err);
		} else {
			ids.forEach(function (id) {
				var board = new BoardModel();
				board.load(id, function (err, props) {
					if (err) {
						return next(err);
					} else {
						//console.log(":::" + props.container);
						if (props.container == undefined || props.container == "") {
							socket.emit('containerDraw', "empty");
						} else {
							socket.emit('containerDraw', props);
						}
					}
				});
			});
		}
	});
};

var writeShapeModels  = function(boardUrl, socket) {
	var ShapesModel = collaboration.shapesModel;
	ShapesModel.find({board_url: boardUrl}, function (err, ids) {
		if (err) {
			console.log(err);
		}
		var len = ids.length;
		var count = 0;
		if (len === 0) {} else {
			ids.forEach(function (id) {
				ShapesModel.load(id, function (err, props) {
					if (err) {
						return next(err);
					} else {
					    socket.emit('eventDraw', eval({
						    palette: props.palette,
						    action: props.action,
						    args: [props.args]
					    }));
                    }
				});
			});
		}
	});
};

var findInBoardModelforSetContainer = function (randomnString, wb_url, data) {
	var BoardModel = collaboration.boardModel;
	BoardModel.find({url:randomnString},function (err, ids) {
		if (err) {
			console.log(err);
		} else {
			ids.forEach(function (id) {
				var board = new BoardModel();
				board.load(id, function (err, props) {
					if (err) {
						return next(err);
					} else {
						console.log("updating");
						props.container = data.containerName;
						props.canvasWidth = data.canvasWidth;
						props.canvasHeight = data.canvasHeight;
						board.store(props, function (err) {
							console.log("Added container to your board successfully!");
							if(err)
							{
								console.log("***** Error in updating container for URL:"+wb_url+" Err:"+err);
							}
						});
					}
				});
			});
		}
	});
};

var drawOnBoard = function (url, data, socket) {
    if (data.action === "clearText") {
        return;
    }
    collaboration.boardModel.find(
        {url:url.replace('boards/', '')},
        function(err, bids) {
            if(bids.length == 0) {
                console.log("Error in finding board");
                socket.emit('eventBoardNotFound');
                socket.broadcast.to(url).emit('eventBoardNotFound');
            } else {
                socket.broadcast.to(url).emit('eventDraw', data);

                data.args = data.args[0];
                data.shapeId = data.args.uid;
                data.board_url = url;

                var shape = new collaboration.shapesModel();
                var ShapesModel = collaboration.shapesModel;

                if (data.action == "modified" || data.action == "zindexchange") {
                    data.args = data.args.object;
                    shape.loadByShapeId(
                        data.shapeId,
                        function(err, props) {
                           if(!err) {
                               data.args.name = props.args.name;
                               data.args.uid = props.shapeId;
                               data.args.palette = props.palette;
                               data.palette = props.palette;
                               data.action = props.action;
                               shape.store(data, function(){});
                               socket.broadcast
                                   .to(url)
                                   .emit('eventDraw', shape);
                           }
                        });
                } else if (data.action == "delete") {
                    shape.loadByShapeId(
                        data.shapeId,
                        function(err, props) {
                            if(!err) {
                                shape.delete(data, function(){});
                            }
                        }
                    );
                } else {
                    shape.store(data, function(){});
                    socket.broadcast.to(url).emit('eventDraw', shape);
                }
            }
        });
};
