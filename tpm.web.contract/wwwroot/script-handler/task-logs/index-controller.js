var IndexController = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory, $q, ApiHelper, DataFactory, $localstorage) {
    $scope.TaskLog = {};
    $scope.TaskLog.FormSearch = {};
    $scope.TaskLog.FormSearch.txtSearch = { Text: "" };
    $scope.TaskLog.FormSearch.ddlCompany = '-1';

    $scope.TaskLog.Lst = [];
    $scope.TaskLog.btnSearch = {};
    $scope.TaskLog.btnExportExcel = {};
    $scope.TaskLog.FormExcel = {};
    $scope.TaskLog.btnExportExcel = {};

    $scope.TaskLog.NodeCategory = {
        IDSelectedTimeOut: false,
        IsSelectedAll: false,
        ShowClearSelected: true,
        NodeResult: { IDSelected: [] }
    };
    $scope.TaskLog.NodeCategory.TreeData = DataSetting.LstUserProductCategory;
    $scope.TaskLog.NodeCategory.core = {
        themes: {
            icons: false
        }
    };

    $scope.TaskLog.Pager = { TotalItems: 0, PageSize: 10, CurrentPage: 1 };

    //#region Ngày
    let today = new Date();
    $scope.TaskLog.FormSearch.dtmDate = {};
    $scope.TaskLog.FormSearch.dtmDate.DisplayValue = moment(today).format('DD/MM/YYYY');
    $scope.TaskLog.FormSearch.Date = moment(today).format('MM/DD/YYYY');
    $('#dtmDate').datetimepicker({
        format: 'DD/MM/YYYY',
        showTodayButton: true,
        showClear: true,
        showClose: true,
        minDate: new Date(1, 1, 1990),
        defaultDate: today
    });
    $("#dtmDate").on("dp.change", function (e) {
        $scope.TaskLog.FormSearch.dtmDate.DisplayValue = $("#dtmDate").val();
        $scope.TaskLog.FormSearch.Date = moment(e.date).format('MM/DD/YYYY');
    });
    //#endregion

    //select cong ty
    $scope.TaskLog.FormSearch.ddlCompany = {};
    $scope.TaskLog.FormSearch.ddlCompany.Lst = [];
    $scope.TaskLog.FormSearch.ddlCompany.Core = {
        IsShowCheckboxAll: true,
        IsShowSearch: true,
        Text: 'CompanyName',
        IDValue: 'CompanyID'
    };
    $scope.TaskLog.FormSearch.ddlCompany.CallBack = {};
    $scope.TaskLog.FormSearch.ddlCompany.CallBack.OnHiddenBsDropdown = function () {
    };

    $scope.TaskLog.btnSearch.OnClick = function (intPage) {
        if (!$scope.TaskLog.FormSearch.Date) {
            jAlert.Warning("Vui lòng chọn ngày", "Thông báo");
            return;
        }

        intPage = !intPage ? 1 : intPage;
        UtilJS.Loading.Show();
        let obj = {};
        obj.KeySearch = $scope.TaskLog.FormSearch.txtSearch.Text;
        obj.CompanyIDs = $scope.TaskLog.FormSearch.ddlCompany.Result ? $scope.TaskLog.FormSearch.ddlCompany.Result.LstIDSelected : [];
        obj.CategoryIDs = $scope.TaskLog.NodeCategory.NodeResult.IDSelected;
        obj.Date = $scope.TaskLog.FormSearch.Date;
        obj.PID = -1;
        obj.PageIndex = intPage - 1;
        obj.PageSize = $scope.TaskLog.Pager.PageSize;
        CommonFactory.PostDataAjax("/TaskLogs/Search", obj,
            function (beforeSend) { },
            function (response) {
                $timeout(function () {
                    UtilJS.Loading.Hide();
                    $scope.TaskLog.Lst = [];
                    $scope.TaskLog.Pager.TotalItems = 0;
                    if (response.objCodeStep.Status == 'Error') {
                        jAlert.Error(response.objCodeStep.Message, 'Thông báo');
                    }
                    else if (response.objCodeStep.Status == 'Warning') {
                        jAlert.Warning(response.objCodeStep.Message, 'Thông báo');
                    }
                    else if (response.objCodeStep.Status == 'Success') {
                        $scope.TaskLog.Lst = response.objCodeStep.Data.Records || [];
                        $scope.TaskLog.Pager.TotalItems = response.objCodeStep.Data.TotalRecord || 0;
                        $scope.TaskLog.Pager.CurrentPage = intPage;
                        $scope.ObjExcel = obj;
                    }
                }, 100);
            },
            function (error) {
                UtilJS.Loading.Hide();
            }
        );
    };

    //export excel
    $scope.TaskLog.btnExportExcel.Onclick = function () {
        if ($scope.TaskLog.Lst.length == 0) {
            jAlert.Warning("Không có dữ liệu để xuất");
            return;
        }
        let _ObjExcel = $scope.ObjExcel;
        UtilJS.Files.Download({
            url: "/TaskLogs/ExportExcel",
            data: { obj: _ObjExcel },
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

    UtilJS.Loading.Show();
    $q.all({
        Companies: DataFactory.Companies_Get()
    }).then((Multiples) => {
        $scope.TaskLog.FormSearch.ddlCompany.Lst = Multiples.Companies.Data;
        $timeout(() => { $rootScope.IsLoadPage = true; }, 0);
        UtilJS.Loading.Hide();
    });
    //#region enter search
    $(document).ready(function () {
        $(document).keypress(function (e) {
            if (e.which == 13) {
                $scope.TaskLog.btnSearch.OnClick();
            }
        });
    });
    //#endregion
}
IndexController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory", "$q", "ApiHelper", "DataFactory", "$localstorage"];
addController('IndexController', IndexController);

