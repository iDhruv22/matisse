var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

UserProvider = function(host, port) {
    this.db= new Db('node-mongo-user', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
    this.db.open(function(){});
};


UserProvider.prototype.getCollection= function(callback) {
    this.db.collection('users', function(error, user_collection) {
        if( error ) callback(error);
        else callback(null, user_collection);
    });
};

//find all users
UserProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, user_collection) {
        if( error ) callback(error)
        else {
            user_collection.find().toArray(function(error, results) {
                if( error ) callback(error)
                else callback(null, results)
            });
        }
    });
};

//find an user by ID
UserProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, user_collection) {
        if( error ) callback(error)
        else {
            user_collection.findOne({_id: user_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
                if( error ) callback(error)
                else callback(null, result)
            });
        }
    });
};

//find an user by email
UserProvider.prototype.findByEmail = function(email, callback) {
    this.getCollection(function(error, user_collection) {
        if( error ) callback(error)
        else {
            user_collection.findOne({email: email}, function(error, result) {
                if( error ) callback(error)
                else callback(null, result)
            });
        }
    });
};


//save new user
UserProvider.prototype.save = function(users, callback) {
    this.getCollection(function(error, user_collection) {
        if( error ) callback(error)
        else {
            if( typeof(users.length)=="undefined")
                users = [users];

            for( var i =0;i< users.length;i++ ) {
                user = users[i];
                user.created_at = new Date();
            }

            user_collection.insert(users, function() {
                callback(null, users);
            });
        }
    });
};

// update an user
UserProvider.prototype.update = function(userId, users, callback) {
    this.getCollection(function(error, user_collection) {
        if( error ) callback(error);
        else {
            user_collection.update(
                {_id: user_collection.db.bson_serializer.ObjectID.createFromHexString(userId)},
                users,
                function(error, users) {
                    if(error) callback(error);
                    else callback(null, users)
                });
        }
    });
};

//delete user
UserProvider.prototype.delete = function(userId, callback) {
    this.getCollection(function(error, user_collection) {
        if(error) callback(error);
        else {
            user_collection.remove(
                {_id: user_collection.db.bson_serializer.ObjectID.createFromHexString(userId)},
                function(error, user){
                    if(error) callback(error);
                    else callback(null, user)
                });
        }
    });
};

exports.UserProvider = UserProvider;