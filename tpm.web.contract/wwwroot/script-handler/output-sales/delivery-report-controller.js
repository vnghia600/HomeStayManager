var DeliveryReportController = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory, $q, ApiHelper, DataFactory, $localstorage) {
    $scope.DeliveryReport = { Lst : [] };
    $scope.DeliveryReport.Pager = { TotalItems: 0, PageSize: 10, CurrentPage: 1 };

    $scope.myroot = {};
    $scope.myroot.Permission = {
        isReadStore: $rootScope.UserPricinpal.IsInRole("UserStore.Read.All"),
    }

    $scope.FormSearch = {
        dtmFromDate: { SelectedValue: '' },
        dtmToDate: { SelectedValue: '' },
        SearchID: "0",
        btnSearch: {},
    };

    $scope.ddlStore = {};
    $scope.ddlStore.Lst = [];
    $scope.ddlStore.Core = {
        IsShowCheckboxAll: true,
        IsShowSearch: true,
        Text: 'StoreName',
        IDValue: 'StoreID'
    };

    $scope.ddlSearch = {};
    $scope.ddlSearch.Lst = [
        { ID: "1", Name: "Giao hàng Viettel" },
        { ID: "2", Name: "Giao hàng DHL" },
        { ID: "3", Name: "Giao hàng Ahamove" },
        { ID: "4", Name: "Giao hàng Ship60" },];
    $scope.ddlSearch.Core = {
        IsShowCheckboxAll: true,
        IsShowSearch: true,
        Text: 'Name',
        IDValue: 'ID'
    };

    //#region dtm
    var today = new Date();
    today.setHours(23, 59, 59);
    var fromday = new Date();
    fromday.setMonth(fromday.getMonth() - 1);
    fromday.setHours(0, 0, 0, 0);

    $('#txtFromDate').datetimepicker({
        format: 'DD/MM/YYYY HH:mm',
        showTodayButton: true,
        showClear: true,
        showClose: true,
        minDate: new Date(1, 0, 1990),
        defaultDate: fromday
    });
    $("#txtFromDate").on("dp.change", function (e) {
        if (!e.date) {
            $scope.FormSearch.FromDateDisplay = '';
            $scope.FormSearch.FromDate = '';
            return;
        }
        e.date._d.setHours(0, 0, 0, 0);
        $scope.FormSearch.FromDateDisplay = moment(e.date).format('DD/MM/YYYY HH:mm');
        var strdate = moment(e.date).format('MM/DD/YYYY HH:mm');
        $scope.FormSearch.FromDate = strdate;
        let EndDate = new Date($scope.FormSearch.ToDate);
        if (e.date._d.getTime() > EndDate.getTime()) {
            e.date._d.setHours(23, 59, 0, 0);
            $('#txtToDate').data("DateTimePicker").date(e.date);
        }
        e.date._d.setHours(23, 59, 0, 0);
        var _newMaxDay = new Date(e.date);
        var _maxDay = new Date(_newMaxDay.getFullYear(), _newMaxDay.getMonth() + 1, _newMaxDay.getDate(), 23, 59, 0, 0);
        $('#txtToDate').data("DateTimePicker").minDate(e.date);
        $('#txtToDate').data("DateTimePicker").date(_maxDay);
        //$('#txtToDate').data("DateTimePicker").maxDate(_maxDay);
    });
    $('#txtToDate').datetimepicker({
        format: 'DD/MM/YYYY HH:mm',
        showTodayButton: true,
        showClear: true,
        showClose: true,
        defaultDate: today,
        maxDate: today
    });
    $("#txtToDate").on("dp.change", function (e) {
        if (!e.date) {
            $scope.FormSearch.ToDateDisplay = '';
            $scope.FormSearch.ToDate = '';
            return;
        }
        $scope.FormSearch.ToDateDisplay = moment(e.date).format('DD/MM/YYYY HH:mm');
        var strdate = moment(e.date).format('MM/DD/YYYY HH:mm');
        $scope.FormSearch.ToDate = strdate;
        e.date._d.setHours(23, 59, 0, 0);
        $('#txtFromDate').data("DateTimePicker").maxDate(e.date);
        let _dayFrom = new Date($scope.FormSearch.FromDate);
        var _minDay = new Date(_dayFrom.getFullYear(), _dayFrom.getMonth() + 1, _dayFrom.getDate());
        if (e.date._d.getTime() > _minDay.getTime()) {
            e.date._d.setHours(0, 0, 0, 0);
            var _newMinDay = new Date(e.date);
            _minDay = new Date(_newMinDay.getFullYear(), _newMinDay.getMonth() - 1, _newMinDay.getDate());
            $('#txtFromDate').data("DateTimePicker").date(_minDay);
        }
    });

    let strfromday = moment(fromday).format('DD/MM/YYYY 00:00');
    let strtoday = moment(today).format('DD/MM/YYYY 23:59');

    $scope.FormSearch.FromDateDisplay = strfromday;
    $scope.FormSearch.ToDateDisplay = strtoday;

    $scope.FormSearch.FromDate = moment(fromday).format('MM/DD/YYYY 00:00');
    $scope.FormSearch.ToDate = moment(today).format('MM/DD/YYYY 23:59');

    //#endregion dtm
    
    $scope.RenderDelivery = function (item) {
        if (item == 1) {
            return "Giao hàng Viettel";
        }
        else if (item == 2) {
            return "Giao hàng DHL";
        }
        else if (item == 3) {
            return "Giao hàng Ahamove";
        }
        else { return "Giao hàng Ship60" }
    };

    $scope.ExportExcel = function () {
        //validate
        if ($scope.DeliveryReport.Lst.length == 0) {
            jAlert.Warning('Không có dữ liệu để xuất');
            return;
        }
        if ($scope.FormSearch.FromDateDisplay == '' || $scope.FormSearch.ToDateDisplay == '') {
            jAlert.Warning('Vui lòng chọn khoảng thời gian tìm kiếm');
            return;
        }
        if ($scope.ddlStore.Result.LstIDSelected.length == 0) {
            jAlert.Warning("Vui lòng chọn cửa hàng");
            return;
        }
        if ($scope.ddlSearch.Result.LstIDSelected.length == 0) {
            jAlert.Warning("Vui lòng chọn đối tác giao hàng", "Thông báo");
            return;
        }
        let Reqs = {};
        Reqs.StoreIDs = $scope.ddlStore.Result.LstIDSelected;
        Reqs.DeliveryCodes = $scope.ddlSearch.Result.LstIDSelected;
        Reqs.DateFrom = $scope.FormSearch.FromDate;
        Reqs.DateTo = $scope.FormSearch.ToDate;
        Reqs.PageIndex = -1;
        Reqs.PageSize = -1;
        UtilJS.Files.Download({
            url: "/OutputSales/ExportExcelDeliveryReport",
            data: { Reqs: Reqs },
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

    $scope.Search = function (intPage) {
        intPage = !intPage ? 1 : intPage;
        //validate
        if ($scope.FormSearch.FromDateDisplay == '' || $scope.FormSearch.ToDateDisplay == '') {
            jAlert.Warning('Vui lòng chọn khoảng thời gian tìm kiếm');
            return;
        }
        if ($scope.ddlStore.Result.LstIDSelected.length == 0) {
            jAlert.Warning("Vui lòng chọn cửa hàng");
            return;
        }
        if ($scope.ddlSearch.Result.LstIDSelected.length == 0) {
            jAlert.Warning("Vui lòng chọn đối tác giao hàng", "Thông báo");
            return;
        }
        let dataSend = {};
        dataSend.Reqs = {};
        dataSend.Reqs.StoreIDs = $scope.ddlStore.Result.LstIDSelected;
        dataSend.Reqs.DeliveryCodes = $scope.ddlSearch.Result.LstIDSelected;
        dataSend.Reqs.DateFrom = $scope.FormSearch.FromDate;
        dataSend.Reqs.DateTo = $scope.FormSearch.ToDate;
        dataSend.Reqs.PageIndex = intPage;
        dataSend.Reqs.PageSize = 10;
        UtilJS.Loading.Show();

        CommonFactory.PostDataAjax("/OutputSales/SearchDeliveryReport", dataSend,
            function (beforeSend) { },
            function (response) {
                $timeout(function () {
                    UtilJS.Loading.Hide();
                    $scope.DeliveryReport.Lst = [];
                    $scope.DeliveryReport.Pager.TotalItems = 0;
                    if (response.objCodeStep.Status != jAlert.Status.Success) {
                        jAlert.Notify(response.objCodeStep);
                        return;
                    } else {
                        $scope.DeliveryReport.Lst = response.objCodeStep.Data.Records || [];
                        $scope.DeliveryReport.Pager.TotalItems = response.objCodeStep.Data.TotalRecord || 0;
                        $scope.DeliveryReport.Pager.CurrentPage = intPage;
                    }
                }, 100);
            },
            function (error) {
                UtilJS.Loading.Hide();
            }
        );
    };


    UtilJS.Loading.Show();
    $q.all({
        Stores: DataFactory.StoreTree_Read($scope.myroot.Permission.isReadStore)
    }).then((Multiples) => {
        $scope.ddlStore.Lst = Multiples.Stores.Data.filter(c => c.IsSaleStore && c.IsActived && !c.IsDeleted );
        $timeout(() => { $rootScope.IsLoadPage = true; }, 0);
        UtilJS.Loading.Hide();
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
}
DeliveryReportController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory", "$q", "ApiHelper", "DataFactory", "$localstorage"];
addController("DeliveryReportController", DeliveryReportController);
//export file
