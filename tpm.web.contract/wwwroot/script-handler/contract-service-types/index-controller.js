var IndexController = ($scope, $rootScope, $timeout, $filter, ApiHelper, UtilFactory, DataFactory, $q, CommonFactory) => {

    //#region declare variable
    var objExportSearch;
    $scope.ServiceType = {};
    $scope.ServiceType.Pager = { TotalItems: 0, PageSize: 5, CurrentPage: 1 };
    $scope.ServiceType.Lst = [];
    $scope.ServiceType.Search = {};
    //#endregion

    $scope.ServiceType.Search.Paging = function (intPage) {
        intPage = !intPage ? 1 : intPage;
        $scope.ServiceType.Pager.CurrentPage = intPage;
    };
    $scope.ServiceType.Search.CustomFilter = function (item) {
        if ($scope.ServiceType.Search.Text) {
            if (!UtilJS.String.IsContain(item.Name, $scope.ServiceType.Search.Text)){
                return false;
            }
        }
        return true;
    };
    //#region search
    $scope.ServiceType.Search.InitData = function () {
        intPage = 1;
        UtilJS.Loading.Show();
        CommonFactory.PostDataAjax("/ContractServiceTypes/Search", {},
            function (beforeSend) { },
            function (response) {
                $timeout(function () {
                    UtilJS.Loading.Hide();
                    $scope.ServiceType.Lst = [];
                    if (response.objCodeStep.Status == jAlert.Status.Error) {
                        jAlert.Error(response.objCodeStep.Message, 'Thông báo');
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Warning) {
                        jAlert.Warning(response.objCodeStep.Message, 'Thông báo');
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Success) {
                        UtilJS.Loading.Hide();
                        $scope.ServiceType.Lst = response.ServiceTypes || [];
                        $scope.ServiceType.Pager.TotalItems = response.ServiceTypes.length || 0;
                        $scope.ServiceType.Pager.CurrentPage = intPage;
                    }
                });
            },
            function (error) {
                UtilJS.Loading.Hide();
            }
        );
    };
    $scope.ServiceType.Search.InitData();
    //#endregion
}
IndexController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "ApiHelper", "UtilFactory", "DataFactory", "$q", "CommonFactory"];
addController("IndexController", IndexController);
