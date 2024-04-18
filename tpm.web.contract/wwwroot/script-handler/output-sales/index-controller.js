var OutputOrderController = function ($scope, $rootScope, $timeout, $filter, $http, UtilFactory, CommonFactory, $q, DataFactory, ApiHelper) {
    $scope.Condition = {};
    $scope.Condition.Keyword = "";
    $scope.Condition.Phone = "";
    $scope.Condition.ProductID = "";
    $scope.PermissionName = {
        OutputOrder: "OutputOrder.Create",
        DCOutputOrder: "DCOutputOrder.Create",
        IvenOutputOrder: "IvenOutputOrder.Create",
        isOutputOrder: false,
        isDCOutputOrder: false,
        isIvenOutputOrder: false,
    }

    //$scope.PermissionName.isOutputOrder = $scope.UserPricinpal.IsInRole($scope.PermissionName.OutputOrder) ? true : false;

    $scope.Pager = { TotalItems: 0, PageSize: 10, CurrentPage: 1 };
    $scope.OutputOrders = [];

    var objSearch = {};
    function SearchOutputOrder(pageIndex) {
        if (!$scope.Condition.Keyword && !$scope.Condition.Phone && !$scope.Condition.ProductID) {
            jAlert.Warning('Vui lòng nhập từ khóa tìm kiếm');
            return false;
        } 
        if (!UtilJS.DateTime.IsValid($scope.Condition.FromDate) || !UtilJS.DateTime.IsValid($scope.Condition.ToDate)) {
            jAlert.Warning('Vui lòng chọn thời gian tìm kiếm');
            return false;
        }
        if (moment($scope.Condition.FromDate)._d.getTime() > moment($scope.Condition.ToDate)._d.getTime()) {
            jAlert.Warning('Từ ngày phải nhỏ hơn đến ngày');
            return false;
        }
        pageIndex = !pageIndex ? 1 : pageIndex;

        objSearch.DateFrom = moment($scope.Condition.FromDate).format('MM/DD/YYYY HH:mm');
        objSearch.DateTo = moment($scope.Condition.ToDate).format('MM/DD/YYYY HH:mm');


        objSearch.OutputSaleID = $scope.Condition.Keyword;
        objSearch.Phone = !$scope.Condition.Phone ? 0 : $scope.Condition.Phone;
        objSearch.ProductID = $scope.Condition.ProductID;

        //objSearch.pageIndex = pageIndex - 1;
        //objSearch.PageSize = $scope.Pager.PageSize;

        UtilJS.Loading.Show();
        //let strApiEndPoint = ApiEndPoint.OutputSalesResource + "SearchMarketing";
        //ApiHelper.PostMethod(strApiEndPoint, objSearch)
        //    .then(function (response) {
        //        UtilJS.Loading.Hide();
        //        $scope.OutputOrders = [];
        //        //$scope.Pager.TotalItems = 0;
        //        $scope.OutputOrders = response.Data;
        //        //$scope.Pager.TotalItems = response.Data.TotalRecord;
        //        //$scope.Pager.CurrentPage = pageIndex;
        //    })
        //    .catch(function (response) {
        //        jAlert.Notify(response);
        //        UtilJS.Loading.Hide();
        //        $scope.OutputOrders = [];
        //        //$scope.Pager.TotalItems = 0;
        //    });

        CommonFactory.PostDataAjax("/OutputSales/Search", { Reqs: objSearch },
            function (beforeSend) { },
            function (response) {
                $timeout(function () {
                    UtilJS.Loading.Hide();
                    if (response.objCodeStep.Status != jAlert.Status.Success) {
                        $scope.OutputOrders = [];
                        jAlert.Notify(response.objCodeStep);
                        return;
                    } else {
                        $scope.OutputOrders = [];
                        //$scope.Pager.TotalItems = 0;
                        $scope.OutputOrders = response.Data;
                        //$scope.Pager.TotalItems = response.Data.TotalRecord;
                        //$scope.Pager.CurrentPage = pageIndex;
                    }
                });
            },
            function (error) {
                $scope.OutputOrders = [];
                UtilJS.Loading.Hide();
            }
        );
    };

    $scope.PageIndexChanged = function (pageIndex) {
        SearchOutputOrder(pageIndex);
    };

    $scope.Search = function () {
        SearchOutputOrder(1);
    };

    $scope.ExportExcel = function () {
        if ($scope.OutputOrders == undefined || $scope.OutputOrders.length == 0) {
            jAlert.Warning("Không có dữ liệu để xuất");
            return;
        }
        var strUrl = "/OutputSales/ExportExcel";
        UtilJS.Files.Download({
            url: strUrl,
            data: { Reqs: objSearch },
            beforsend: function () {
                $timeout(function () { UtilJS.Loading.Show(); });
            },
            success: function (result) {
                $timeout(function () { UtilJS.Loading.Hide(); });
                if (result == undefined) return;
                if (result.objCodeStep.Status != jAlert.Status.Success) {
                    jAlert.Notify(result.objCodeStep);
                    return;
                }
            }
        });
    };

    //Init page

    let minDate = new Date(0);

    let date7 = new Date();
    date7.setHours(23, 59, 0, 0);

    let today = new Date();
    today.setDate(today.getDate() - 30);
    today.setHours(0, 0, 0, 0);

    $scope.dtmFromDate = { Core: {}, CallBack: {} };
    $scope.dtmFromDate.Core.DateType = "DateTime";
    $scope.dtmFromDate.CallBack.OnValuechanged = (x) => {
        let startDate = moment(x);
        startDate._d.setHours(0, 0, 0, 0);
        $scope.Condition.FromDate = startDate;
        if (UtilJS.DateTime.IsValid($scope.Condition.FromDate)) {
            startDate = moment($scope.Condition.FromDate);
            startDate._d.setHours(23, 59, 0, 0);;
            $scope.dtmToDate.API.SetMinDate(startDate);
        }
    };

    $scope.dtmToDate = { Core: {}, CallBack: {} };
    $scope.dtmToDate.Core.DateType = "DateTime";
    $scope.dtmToDate.CallBack.OnValuechanged = (x) => {
        let endDate = moment(x);
        endDate._d.setHours(23, 59, 0, 0);
        $scope.Condition.ToDate = endDate;
    };

    $scope.Condition.FromDate = today;
    $scope.Condition.ToDate = date7;
    UtilJS.Loading.Show();
    $q.all({
        x: UtilFactory.WaitingLoadDirective([$scope.dtmFromDate, $scope.dtmToDate])
    }).then((m) => {
        $scope.dtmFromDate.API.SetValue($scope.Condition.FromDate);
        $scope.dtmToDate.API.SetValue($scope.Condition.ToDate);

        UtilJS.Loading.Hide();
        $timeout(() => { $rootScope.IsLoadPage = true; }, 0);
    });

    //#region enter search
    $(document).ready(function () {
        $(document).keypress(function (e) {
            if (e.which == 13) {
                $scope.Search();
            }
        });
    });
    //#endregion
};

OutputOrderController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "$http", "UtilFactory", "CommonFactory", "$q", "DataFactory", "ApiHelper"];

addController("OutputOrderController", OutputOrderController);