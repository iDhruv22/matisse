module.exports = {
    authenticate: function() {
      var UserModel = require(__dirname + '/../models/UserModel.js');
      var everyauth = require('everyauth');
      var conf = require('./conf');

      //-------------------- EveryAuth START---------------------------------//
      var usersById = {};
      var nextUserId = 0;

      var users = {};

      everyauth
        .facebook
        .appId(conf.fb.appId)
        .appSecret(conf.fb.appSecret)
        .findOrCreateUser(function(sess, accessToken, accessSecret, user) {
          var userDetails = users[user.id] || (users[user.id] = addUser('facebook', user));
          var data = {
            userID: 'facebook' + "- " + userDetails['facebook'].id
          };
          var newUser = new UserModel();
          newUser.store(data, function(err) {
            if (!err) console.log("saved new user to DB");
            else console.log("Could not Save user, possibly exist in DB");
          });
          return userDetails;

          return usersByFbId[fbUserMetadata.id] ||
            (usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata));
        })
        .redirectPath('/');

      everyauth
        .twitter
        .consumerKey(conf.twit.appId)
        .consumerSecret(conf.twit.appSecret)
        .findOrCreateUser(function(sess, accessToken, accessSecret, user) {
          var userDetails = users[user.id] || (users[user.id] = addUser('twitter', user));
          var data = {
            userID: 'twitter' + "- " + userDetails['twitter'].id
          };
          var newUser = new UserModel();
          newUser.store(data, function(err) {
            if (!err) console.log("saved new user to DB");
            else console.log("Could not Save user, possibly exist in DB");
          });
          return userDetails;

        })
        .redirectPath('/');

      everyauth
        .google
        .appId(conf.google.appId)
        .appSecret(conf.google.appSecret)
        .scope('https://www.googleapis.com/auth/userinfo.profile')
        .findOrCreateUser(function(sess, accessToken, accessSecret, user) {
          user.refreshToken = accessSecret.refresh_token;
          user.expiresIn = accessSecret.expires_in;
          var userDetails = users[user.id] || (users[user.id] = addUser('google', user));
          var data = {
            userID: 'google' + "- " + userDetails['google'].id
          };
          var newUser = new UserModel();
          newUser.store(data, function(err) {
            if (!err) console.log("saved new user to DB");
            else console.log("Could not Save user, possibly exist in DB");
          });
          return userDetails;
        })
        .redirectPath('/');

      everyauth.facebook.sendResponse(function(res, data) {
        var session = data.session;
        res.redirect(session.redirectPath || // Re-direct to the path stored in the session by route middleware
          this.redirectPath()); // Or redirect to the configured redirectPath
      });

      everyauth.twitter.sendResponse(function(res, data) {
        var session = data.session;
        res.redirect(session.redirectPath || // Re-direct to the path stored in the session by route middleware
          this.redirectPath()); // Or redirect to the configured redirectPath
      });

      everyauth.google.sendResponse(function(res, data) {
        var session = data.session;
        res.redirect(session.redirectPath || // Re-direct to the path stored in the session by route middleware
          this.redirectPath()); // Or redirect to the configured redirectPath
      });

      everyauth.everymodule
        .findUserById(function(id, callback) {
          callback(null, usersById[id]);
        });

      function addUser(source, sourceUser) {
        var user;
        if (arguments.length === 1) { // password-based
          user = sourceUser = source;
          user.id = ++nextUserId;
          return usersById[nextUserId] = user;
        } else { // non-password-based
          user = usersById[++nextUserId] = {
            id: nextUserId
          };
          user[source] = sourceUser;
        }
        return user;
      }
      everyauth.debug = true;
    }
  }
  //-------------------- EveryAuth END---------------------------------//