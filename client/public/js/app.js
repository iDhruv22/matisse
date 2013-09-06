var modules = [
    "httpService",
    "localization"
]
angular.module('matisse', modules).
    config(['$routeProvider', function ($routeProvider) {
        'use strict';
        $routeProvider.
            when('/',
                {
                    templateUrl: 'public/templates/main.html',
                    controller: ApplicationController
                }).
            when('/home',
                {
                    templateUrl: 'public/templates/home.html',
                    controller: HomeController
                }).
            otherwise({
                redirectTo: "/"
            });
    }]);