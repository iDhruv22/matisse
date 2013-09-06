var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

BoardProvider = function(host, port) {
    this.db= new Db('node-mongo-board', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
    this.db.open(function(){});
};


BoardProvider.prototype.getCollection= function(callback) {
    this.db.collection('boards', function(error, board_collection) {
        if( error ) callback(error);
        else callback(null, board_collection);
    });
};

//find all boards
BoardProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, board_collection) {
        if( error ) callback(error)
        else {
            board_collection.find().toArray(function(error, results) {
                if( error ) callback(error)
                else callback(null, results)
            });
        }
    });
};

//find an board by ID
BoardProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, board_collection) {
        if( error ) callback(error)
        else {
            board_collection.findOne({_id: board_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
                if( error ) callback(error)
                else callback(null, result)
            });
        }
    });
};

//find an board by email
BoardProvider.prototype.findByEmail = function(email, callback) {
    this.getCollection(function(error, board_collection) {
        if( error ) callback(error)
        else {
            board_collection.find({email: email}, function(error, result) {
                if( error ) callback(error)
                else callback(null, result)
            });
        }
    });
};


//save new board
BoardProvider.prototype.save = function(boards, callback) {
    this.getCollection(function(error, board_collection) {
        if( error ) callback(error)
        else {
            if( typeof(boards.length)=="undefined")
                boards = [boards];

            for( var i =0;i< boards.length;i++ ) {
                board = boards[i];
                board.created_at = new Date();
            }

            board_collection.insert(boards, function() {
                callback(null, boards);
            });
        }
    });
};

// update an board
BoardProvider.prototype.update = function(boardId, boards, callback) {
    this.getCollection(function(error, board_collection) {
        if( error ) callback(error);
        else {
            board_collection.update(
                {_id: board_collection.db.bson_serializer.ObjectID.createFromHexString(boardId)},
                boards,
                function(error, boards) {
                    if(error) callback(error);
                    else callback(null, boards)
                });
        }
    });
};

//delete board
BoardProvider.prototype.delete = function(boardId, callback) {
    this.getCollection(function(error, board_collection) {
        if(error) callback(error);
        else {
            board_collection.remove(
                {_id: board_collection.db.bson_serializer.ObjectID.createFromHexString(boardId)},
                function(error, board){
                    if(error) callback(error);
                    else callback(null, board)
                });
        }
    });
};

exports.BoardProvider = BoardProvider;