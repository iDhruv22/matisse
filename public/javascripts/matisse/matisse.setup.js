/**
 * User: Bahvani Shankar,Pradeep
 * Date: 12/26/11
 * Time: 11:16 AM
 * About this :Entry Point File, All Dom Ready functions need to be defined here
 */

define(["matisse", "matisse.fabric", "matisse.comm", "matisse.main", "matisse.containers", "matisse.containers.devices", "matisse.layouts", "features/modified-by-user", "features/shared-users", "features/chat", "matisse.layouts.content", "matisse.palettes", "matisse.palettes.basicshapes", "matisse.palettes.wireframe", "matisse.palettes.components", "matisse.events", "../javascripts/thirdparty/csspopup.js", "matisse.help"], function(matisse, mfabric, Comm, main, containers, palettes, layouts, modifiedByUser, sharedUsers, chat) {

  "use strict";
  //Dom Ready function
  $(function() {
    var serverURL = 'http://' + location.host; //change it to server ip or local ip for testing from other machines

    var comm = new Comm(serverURL);
    /**
     * Initializes the application with the containers and layout set by user or asks your to choose them if not set yet
     * @method comm.onContainerDraw
     * @param data - container name and layout type
     *
     */
    comm.onContainerDraw = function(data) {
        /* get container and layout data from server if any and assing it */
        data == 'empty' ? matisse.containerName = data : matisse.containerName = data.container;
        /* if data is available then start application with this container and layout*/
        if (matisse.containerName !== 'empty') {
          containers.containerName = matisse.containerName;
          containers.canvasWidth = data.canvasWidth;
          containers.canvasHeight = data.canvasHeight;
          containers.setContainer(matisse.containerName, 'old', containers.canvasWidth, containers.canvasHeight);
          $('#boardName').text(data.name);
          $('#boardName').css("top", $('#boardName').width() + 60);
          return;
        }
        /* if data is not available or user logs in for the first time, show him the list of container names and layouts to choose */
        //layouts.createLayoutsList();
        containers.createContainerList();
      }
      /**
       * Displays welcome message with user name
       * @param data - user details
       */
    $.get('/userinfo',
      function(info) {
        /* check if userName is missing, show welcome message*/
        if (matisse.userName == null) {
          // key is login-service name like 'twitter', 'google'
          var userInfoKey = info.loginService.toLowerCase();
          var user = info[userInfoKey];
          matisse.userName = user.name;
          matisse.userProfilePic = user.profile_image_url || user.picture;
          matisse.userLoginService = info.loginService;
          $('#userProfilePic').append('<img src="' + matisse.userProfilePic + '" alt="pic" class="b-userpic"></img>');
          $('#userProfilePicBig').append('<img src="' + matisse.userProfilePic + '" alt="pic" class="b-userpic-big"></img>');
          $('#userName').html(matisse.userName);
          $('#userLoginService').html(matisse.userLoginService);
        }
      }, 'json');

    /* Redirecting the user to home page when an active board is deleted.*/
    comm.onDisableActiveBoard = function() {
      $('div.inactive-alert').slideDown(400).delay(2000).fadeOut(1000);
      setTimeout(function() {
        window.location = '/';
      }, 3500);
    };
    matisse.comm = comm;
    matisse.main = main;
    main.addTools();

    modifiedByUser.init();
    sharedUsers.init();
    chat.init();
  });
});