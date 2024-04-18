var IndexController = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory, DataFactory, $q) {
    //#region declare variable
    $scope.PnSearch = {
        btnSearch: {},
        Lst: [],
        Pager: { TotalItems: 0, PageSize: 10, CurrentPage: 1 },
    };
    //#endregion

    //Dopdown cửa hàng
    $scope.PnSearch.NodeStore = { Lst: [], Result: { LstIDSelected: [] }, CallBack: {} };
    $scope.PnSearch.NodeStore.Core = {
        IsShowCheckboxAll: false,
        IsShowSearch: true,
        IsCheckAll: false,
        Text: 'StoreName',
        IDValue: 'StoreID'
    };
    $scope.PnSearch.NodeStore.Core.CustomSelectType = "Single";
    //Dopdown Trạng thái

    ////#region sieu thi
    //$scope.PnSearch.NodeStore = { IDSelectedTimeOut: false, IsSelectedAll: false, NodeResult: { IDSelected: [] }, CallBack: {} };
    //$scope.PnSearch.NodeStore.core = { themes: { icons: false } };
    //$scope.PnSearch.NodeStore.TreeData = _.map(DataSetting.LstUserStoreGroupTree, _.clone);
    //$scope.PnSearch.NodeStore.CallBack.OnHiddenBsDropdown = function () {};
    ////#endregion

    //#region search
    $scope.PnSearch.btnSearch.OnClick = function () {
        if ($scope.PnSearch.NodeStore.Result.LstIDSelected.length == 0) {
            jAlert.Warning("Vui lòng chọn cửa hàng");
            return;
        }
        $scope.PnSearch.btnSearch.OnLoad(1);
    }

    $scope.PnSearch.btnSearch.OnLoad = function (intPage) {
        if ($scope.PnSearch.NodeStore.Result.LstIDSelected.length == 0) {
            return;
        }

        intPage = !intPage ? 1 : intPage;
        $scope.PnSearch.Pager.CurrentPage = intPage;
        let objSearch = {};
        objSearch.StoreIDs = [];
        objSearch.StoreIDs = $scope.PnSearch.NodeStore.Result.LstIDSelected[0];
        objSearch.PageIndex = intPage;
        objSearch.PageSize = 10;
        
        //xu ly data all thì post len server
        var url = "/Online/SearchStaffFollowStore";
        UtilJS.Loading.Show();
        CommonFactory.PostDataAjax(url, { obj: objSearch },
            function (beforeSend) { },
            function (response) {
                UtilJS.Loading.Hide();
                if (response.objCodeStep.Status != jAlert.Status.Success) {
                    $scope.PnSearch.Lst = [];
                    $scope.PnSearch.Pager.TotalItems = 0;
                    jAlert.Notify(response.objCodeStep);
                    return;
                }
                else {
                    $scope.PnSearch.Lst = response.Data || [];
                    $scope.PnSearch.Lst = $scope.PnSearch.Lst;
                    $scope.PnSearch.Lst.sort(function (a, b) {
                        return b.PositionID - a.PositionID;
                    });
                    $scope.PnSearch.Pager.TotalItems = $scope.PnSearch.Lst.length;
                    if ($scope.PnSearch.Lst.length == 0) {
                        jAlert.Warning('Không có dữ liệu hoặc bạn không có quyền xem dữ liệu');
                    }
                    $scope.PnSearch.Pager.CurrentPage = intPage;
                }
            },
            function (error) {
                UtilFactory.Alert.RequestError(error);
                UtilJS.Loading.Hide();
            }
        );
    }
    //#endregion

    //#region export excel
    $scope.PnSearch.ExportExcel = function () {
        if ($scope.PnSearch.Lst.length == 0) {
            jAlert.Warning('Không có dữ liệu để xuất');
            return;
        }
        if ($scope.PnSearch.NodeStore.Result.LstIDSelected.length == 0) {
            jAlert.Warning("Vui lòng chọn cửa hàng");
            return;
        } 
        

        let objSearch = {};
        objSearch.StoreIDs = [];
        objSearch.StoreIDs = $scope.PnSearch.NodeStore.Result.LstIDSelected[0];

        UtilJS.Files.Download({
            url: "/Online/ExportExcelStaffFollowStore",
            data: { obj: objSearch },
            beforsend: function () {
                $timeout(function () { UtilJS.Loading.Show(); });
            },
            callback: function (result) {
                $timeout(function () { UtilJS.Loading.Hide(); });
                if (result == undefined) return;
                if (result.objCodeStep.Status != jAlert.Status.Success) {
                    jAlert.Notify(result.objCodeStep);
                    return;
                }
            }
        });
    };
    //#endregion

    $(document).ready(function () {
        $(document).keypress(function (e) {
            if (e.which == 13) {
                $scope.PnSearch.btnSearch.OnClick();
            }
        });
    });
    //#endregion

    UtilJS.Loading.Show();
    $q.all({
        Stores: DataFactory.Stores_Get()
    }).then((Multiples) => {
        $scope.PnSearch.NodeStore.Lst = Multiples.Stores.Data;
        $timeout(() => { $rootScope.IsLoadPage = true; }, 0);
        UtilJS.Loading.Hide();
    });
}
IndexController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory", "DataFactory", "$q"];

addController("IndexController", IndexController);