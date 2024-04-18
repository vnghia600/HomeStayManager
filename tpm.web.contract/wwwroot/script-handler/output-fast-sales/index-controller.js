var IndexController = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory, $q, ApiHelper, DataFactory, $window) {
    $scope.Permission = {};
    $scope.Permission.Create = $rootScope.UserPricinpal.IsInRole("OutputFastSale.Create.CRMPartner");
    $scope.Permission.Export = $rootScope.UserPricinpal.IsInRole("OutputFastSale.Export.CRMPartner");

    //#region declare variable
    $scope.OSFO = {
        Pager: { TotalItems: 0, PageSize: 10, CurrentPage: 1 },
        Lst: [],
        btnSearch: {}
    };
    $scope.FormSearch = {};
    //#endregion

    //#region  Trang thai
    $scope.ddlStatus = {};
    $scope.ddlStatus.Core = {
        IsShowCheckboxAll: true,
        IsShowSearch: true,
        IsCheckAll: true,
        Text: 'OutputFastStatusName',
        IDValue: 'OutputFastStatusID'
    };
    $scope.ddlStatus.CallBack = {};
    $scope.ddlStatus.CallBack.OnHiddenBsDropdown = function () {
    };
    //#endregion

    //#region  Cua hang
    $scope.ddlStore = {};
    $scope.ddlStore.Lst = [];
    $scope.ddlStore.Core = {
        IsShowCheckboxAll: true,
        IsShowSearch: true,
        IsCheckAll: true,
        Text: 'StoreName',
        IDValue: 'StoreID'
    };
    $scope.ddlStore.CallBack = {};
    $scope.ddlStore.CallBack.OnHiddenBsDropdown = function () {
    };
    //#endregion

    function monthDiff(fromDate, toDate) {
        var months;
        months = (toDate.getFullYear() - fromDate.getFullYear()) * 12;
        months -= fromDate.getMonth();
        months += toDate.getMonth();
        if (toDate.getDate() > fromDate.getDate()) {
            months++;
        }

        return months <= 0 ? 0 : months;
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var fromday = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    $scope.dtmCreatedDateFrom = { Core: {}, CallBack: {}, API: {} };
    $scope.dtmCreatedDateFrom.Core.DateType = "DateTime";
    $scope.dtmCreatedDateFrom.CallBack.OnValuechanged = (x) => {
        $scope.FormSearch.dtmFrom = null;
        if (UtilJS.DateTime.IsValid(x)) {
            $scope.FormSearch.dtmFrom = x;
            let StartDate = moment(x)._d;
            $scope.dtmCreatedDateTo.API.SetMinDate(StartDate);
        }
    };

    $scope.dtmCreatedDateTo = { Core: {}, CallBack: {}, API: {} };
    $scope.dtmCreatedDateTo.Core.DateType = "DateTime";
    $scope.dtmCreatedDateTo.CallBack.OnValuechanged = (x) => {
        $scope.FormSearch.dtmTo = null;
        if (x) {
            $scope.FormSearch.dtmTo = x;
        }
    };
    //#endregion

    $scope.PnCustomerSearchModal = {};
    $scope.PnCustomerSearchModal.CallBack = {
        ChoosedItem: function (item) {
            if (item.Phone) {

                item.Phone = '0' + item.Phone;
            }
            $scope.FormSearch.CustomerPhone = item.Phone;
            $scope.PnCustomerSearchModal.API.HideModal();
        }
    };
    $scope.FormSearch.ShowCustomerSearchModal = function () {
        $scope.PnCustomerSearchModal.API.ShowModal();
    };
    $scope.FormSearch.ClearCustomerInfo = function () {
        $scope.FormSearch.CustomerPhone = "";
    };

    let dataSend = {};
    $scope.OSFO.btnSearch.Onclick = function (intPage) {
        if (!UtilJS.DateTime.IsValid($scope.FormSearch.dtmFrom) || !UtilJS.DateTime.IsValid($scope.FormSearch.dtmTo)) {
            jAlert.Warning('Vui lòng chọn thời gian tìm kiếm');
            return false;
        }
        let dateFrom = moment($scope.FormSearch.dtmFrom)._d;
        let dateTo = moment($scope.FormSearch.dtmTo)._d;

        let ressult = monthDiff(
            dateFrom,  // February 1st, 2010
            dateTo  // March 12th, 2010
        );

        if (ressult > 1) {
            jAlert.Warning('Thời gian tìm kiếm tối đa 1 tháng');
            return false;
        }

        var reg = new RegExp('^[0-9]+$');

        if ($scope.FormSearch.OFSID != ''
            && $scope.FormSearch.OFSID != null
            && !reg.test($scope.FormSearch.OFSID)) {

            jAlert.Warning('Chuỗi tìm chỉ cho phép nhập số');
            return false;
        }

        intPage = !intPage ? 1 : intPage;
        UtilJS.Loading.Show();

        dataSend.Keyword = $scope.FormSearch.OFSID;
        dataSend.CreatedDateFrom = $scope.FormSearch.dtmFrom;
        dataSend.CreatedDateTo = $scope.FormSearch.dtmTo;
        //dataSend.OutputStoreIDs = $scope.ddlStore.Result.LstIDSelected;
        dataSend.OutputFastStatusIDs = $scope.ddlStatus.Result.LstIDSelected;
        dataSend.PageSize = $scope.OSFO.Pager.PageSize;
        dataSend.PageIndex = intPage;

        CommonFactory.PostDataAjax("/OutputFastSales/Search", dataSend,
            function (beforeSend) { },
            function (response) {
                $timeout(function () {
                    UtilJS.Loading.Hide();
                    $scope.Lst = [];
                    $scope.OSFO.Pager.TotalItems = 0;

                    $scope.OSFO.Lst = [];
                    $scope.OSFO.Pager.CurrentPage = intPage;

                    if (response.objCodeStep.Status == jAlert.Status.Error) {
                        jAlert.Error(response.objCodeStep.Message, 'Thông báo');
                        return;
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Warning) {
                        jAlert.Warning(response.objCodeStep.Message, 'Thông báo');
                        return;
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Success) {
                        $scope.OSFO.Lst = response.objCodeStep.Data.Records || [];
                        $scope.OSFO.Pager.TotalItems = response.objCodeStep.Data.TotalRecord || 0;
                        $scope.OSFO.Pager.CurrentPage = intPage;
                    }
                });
            },
            function (error) {
                UtilJS.Loading.Hide();
            }
        );
    };

    $scope.OSFO.btnExportExcel_Onclick = function () {
        if ($scope.OSFO.Lst.length == 0) {
            jAlert.Warning("Không có dữ liệu để xuất");
            return;
        }
        dataSend.PageSize = -1;
        dataSend.PageIndex = -1;
        UtilJS.Files.Download({
            url: "/OutputFastSales/ExportExcel",
            data: { Reqs: dataSend },
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

    //#region fnCheckDelete
    $scope.fnCheckDelete = function (item) {
        if (item.StatusID == OutputSaleFastnOnlineStatusEnum.ChuaXuatChinhThuc) {
            return true;
        }
        return false;
    };
    //#endregion

    $scope.OSFO.OnItemDelete = function (item) {
        jConfirm('Thông báo', 'Bạn có chắc muốn xóa?', function (isOK) {
            if (!isOK)
                return;
            var url = '/OutputFastSales/Delete';
            var dataSend = {
                ID: item.OSFOID
            };
            UtilJS.Loading.Show();
            CommonFactory.PostDataAjax(url, dataSend,
                function (beforeSend) { },
                function (response) {
                    UtilJS.Loading.Hide();
                    if (response.objCodeStep.Status == jAlert.Status.Error) {
                        jAlert.Error(response.objCodeStep.Message);
                        return;
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Warning) {
                        jAlert.Warning(response.objCodeStep.Message);
                        return;
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Success) {
                        $scope.OSFO.Lst = $scope.OSFO.Lst.filter(function (itemDelete) {
                            return itemDelete.OSFOID != item.OSFOID;
                        });
                        $scope.OSFO.Pager.TotalItems--;
                        //$scope.Pager.TotalItems = $scope.OSFO.Lst.length;
                        if ($scope.OSFO.Pager.TotalItems % $scope.OSFO.Pager.PageSize == 0) {
                            $scope.OSFO.btnSearch.Onclick(1);
                        }
                        jAlert.Success(response.objCodeStep.Message);
                    }
                },
                function (error) {
                    UtilJS.Loading.Hide();
                }
            );
        });
    };
    $scope.OSFO.btnExportExcel = {};
    $scope.OSFO.btnExportExcel.Onclick = function () {
        if ($scope.OSFO.Lst.length == 0) {
            jAlert.Warning("Không có dữ liệu để xuất");
            return;
        }
        dataSend.PageSize = -1;
        dataSend.PageIndex = -1;
        UtilJS.Files.Download({
            url: "/OutputFastSales/ExportExcel",
            data: { Reqs: dataSend },
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
        wait: UtilFactory.WaitingLoadDirective([
            $scope.dtmCreatedDateFrom,
            $scope.dtmCreatedDateTo,
            $scope.ddlStatus,
        ])
    }).then((Multiples) => {
        $scope.ddlStatus.Lst = DataSetting.OutputFastStatus.filter(c => c.OutputFastStatusID != 10 && c.OutputFastStatusID != 11);
        $scope.ddlStatus.API.SelectAll();

        let today = new Date();
        today.setDate(today.getDate());
        today.setHours(23, 59, 0, 0);

        let subday = new Date();
        subday.setDate(subday.getDate());
        subday.setHours(0, 0, 0, 0);

        $scope.dtmCreatedDateFrom.API.SetValue(subday);
        $scope.dtmCreatedDateTo.API.SetValue(today);
        $timeout(() => { $rootScope.IsLoadPage = true; }, 0);
        UtilJS.Loading.Hide();
    });
};
IndexController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory", "$q", "ApiHelper", "DataFactory", "$window"];
addController("IndexController", IndexController);

var sumPropFromList = function () {
    return function (input, property) {
        if (!input || input.length == 0)
            return 0;
        var i = input.length;
        var total = 0;
        while (i--)
            total += input[i][property] == undefined ? 0 : input[i][property];
        return total;
    };
};
addFilter("sumPropFromList", sumPropFromList);

function isValidPhone(n) {
    if (n == "0123456789") {
        return true;
    }
    if (!n) {
        return false;
    }
    //var t = new RegExp(/^(\+|0)(\d{7,15})$/);
    if (n.length < 10) {
        return false;
    }
    var t = new RegExp(/^(01[2689]|07|08|03|05|09)[0-9]{8}$/);
    return t.test(n);
}
function isValidContactPhone(n) {
    if (!n) {
        return true;
    }
    return isValidPhone(n);
}
