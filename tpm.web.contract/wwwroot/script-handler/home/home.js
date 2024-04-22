var IndexController = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory, DataFactory, $q) {
    $scope.home = {}
    $scope.home.roomInfo = [
        {
            RoomName: "Duck",
            CustomerName: "string",
            Time: "string",
            Note: "string"
        },
        {
            RoomName: "Dove",
            CustomerName: "string",
            Time: "string",
            Note: "string"
        },
        {
            RoomName: "Flamingo",
            CustomerName: "string",
            Time: "string",
            Note: "string"
        },
        {
            RoomName: "Sheep",
            CustomerName: "string",
            Time: "string",
            Note: "string"
        },
        {
            RoomName: "Mr Bean",
            CustomerName: "string",
            Time: "string",
            Note: "string"
        }
    ]
}
IndexController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory", "DataFactory", "$q"];

addController("IndexController", IndexController);