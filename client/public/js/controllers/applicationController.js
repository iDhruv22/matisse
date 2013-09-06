function ApplicationController($scope, $location, connect, localize) {
    "use strict";
    $scope.userName = undefined;
    $scope.email = undefined;
    $scope.password = undefined;
    $scope.lang = "en-US";
    $scope.authenticateUser = function () {
        if ($scope.email && $scope.password) {
            connect.authenticate({email: $scope.email, password: $scope.password},
                function (data) {
                    $scope.userName = data.user;
                    $scope.createdNum = data.createdNum == null? 0 : data.createdNum;
                    $scope.sharedNum = data.sharedNum == null? 0 : data.sharedNum;
                    // Change path and handle success
                }, function (data) {
                    console.log("Error: ", data.error);
                });
        }
        return false;
    };
    $scope.islogged = function () {
        connect.authenticate({email: null, password: $scope.password},
            function (data) {
                $scope.userName = data.user;
                $scope.createdNum = data.createdNum == null? 0 : data.createdNum;
                $scope.sharedNum = data.sharedNum == null? 0 : data.sharedNum;
                // Change path and handle success
            }, function (data) {
                console.log("Error: ", data.error);
            });
    };
    $scope.logoutUser = function () {
        connect.logout({},
            function (data) {
                $scope.userName = undefined;
                $scope.createdNum = undefined;
                $scope.sharedNum = undefined;
            }, function (data) {
                console.log("Error: ", data.error);
            });
    };

    $scope.setEnglishLanguage = function () {
        localize.setLanguage('en-US');
    };

    $scope.setPigLatinLanguage = function () {
        localize.setLanguage('es-es');
    };
}

ApplicationController.$inject = [
    "$scope",
    "$location",
    "connect",
    "localize"
];