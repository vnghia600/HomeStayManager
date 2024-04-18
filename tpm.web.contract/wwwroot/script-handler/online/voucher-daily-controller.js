var VoucherDailyOnlineController = ($scope, $rootScope, $timeout, $filter, ApiHelper, UtilFactory, DataFactory, $q) => {
    //#region declare variable
    $scope.VoucherDailyOnline = {
        btnExportExcel: {},
        btnSearch: {}
    };
    $scope.myroot = {};
    $scope.PnVoucherDailyOnline = {
        btnSave: {},
        CreateOrder: {},
        IsDisable: false
    };

    $scope.VoucherDailyOnline.Pager = { TotalItems: 0, PageSize: 10, CurrentPage: 1 };
    $scope.VoucherDailyOnline.Permission = { IsCreate: true, isDelete: true };
    $scope.VoucherDailyOnline.ObjSearch = { TypeID: '-1' };
    $scope.myroot.Permission = {
        isReadCategory: $rootScope.UserPricinpal.IsInRole("UserProductCategory.Read.All"),
        isReadStore: $rootScope.UserPricinpal.IsInRole("UserStore.Read.All")
    };

    //Dopdown ngành hàng
    $scope.myroot.ddlUserProductCategory = { IDSelectedTimeOut: false, IsSelectedAll: false, NodeResult: { IDSelected: [] } };
    $scope.myroot.ddlUserProductCategory.TreeData = [];
    $scope.myroot.ddlUserProductCategory.core = {
        themes: {
            icons: false
        }
    };

    //#endregion

    //#region Dopdown Store
    $scope.myroot.ddlStore = { IDSelectedTimeOut: false, IsSelectedAll: false, NodeResult: { IDSelected: [] } };
    $scope.myroot.ddlStore.TreeData = [];
    $scope.myroot.ddlStore.core = {
        themes: {
            icons: false
        }
    };
    $scope.myroot.ddlStore.CallBack = {};
    //#endregion

    //#region Dopdown HT thu chi
    $scope.VoucherDailyOnline.NodeVoucherType = { Lst: [], Result: { LstIDSelected: [] }, CallBack: {} };
    $scope.VoucherDailyOnline.NodeVoucherType.Core = {
        IsShowCheckboxAll: true,
        IsShowSearch: true,
        IsCheckAll: true,
        Text: 'VoucherTypeName',
        IDValue: 'VoucherTypeID'
    };
    //#endregion
    //#region Dopdown HT thanh toán
    $scope.VoucherDailyOnline.NodePaymentType = { Lst: [], Result: { LstIDSelected: [] }, CallBack: {} };
    $scope.VoucherDailyOnline.NodePaymentType.Core = {
        IsShowCheckboxAll: true,
        IsShowSearch: true,
        IsCheckAll: true,
        Text: 'PaymentTypeName',
        IDValue: 'PaymentTypeID'
    };
    //#endregion

    //#region dtm
    var fromday = new Date(); //fromday.setDate(fromday.getDate() - 1);
    fromday.setHours(0, 0, 0, 0);
    var todate = new Date(); //todate.setDate(todate.getDate() - 1);
    todate.setHours(23, 59, 0, 0);
    //txtFromDate
    $scope.VoucherDailyOnline.ObjSearch.FromDateDisplay = moment(fromday).format('DD/MM/YYYY HH:mm');
    $scope.VoucherDailyOnline.ObjSearch.FromDate = moment(fromday).format('MM/DD/YYYY HH:mm');
    $('#txtFromDate').datetimepicker({
        format: 'DD/MM/YYYY HH:mm',
        showTodayButton: true,
        showClear: false,
        showClose: true,
        defaultDate: fromday,
        minDate: '2011-01-01',
        maxDate: todate
    });
    $("#txtFromDate").on("dp.change", function (e) {
        $scope.VoucherDailyOnline.ObjSearch.FromDateDisplay = $("#txtFromDate").val();
        $scope.VoucherDailyOnline.ObjSearch.FromDate = moment(e.date).format('MM/DD/YYYY HH:mm');

        let EndDate = new Date($scope.VoucherDailyOnline.ObjSearch.ToDate);
        if (e.date._d.getTime() > EndDate.getTime()) {
            e.date._d.setHours(23, 59, 0, 0);
            $('#txtToDate').data("DateTimePicker").date(e.date);
        }
        e.date._d.setHours(0, 0, 0, 0);
        $('#txtToDate').data("DateTimePicker").minDate(e.date);
    });

    //txtToDate
    $scope.VoucherDailyOnline.ObjSearch.ToDateDisplay = moment(todate).format('DD/MM/YYYY HH:mm');
    $scope.VoucherDailyOnline.ObjSearch.ToDate = moment(todate).format('MM/DD/YYYY HH:mm');

    $('#txtToDate').datetimepicker({
        format: 'DD/MM/YYYY HH:mm',
        showTodayButton: true,
        showClear: false,
        showClose: true,
        defaultDate: todate,
        minDate: fromday,
        maxDate: todate
    });
    $("#txtToDate").on("dp.change", function (e) {
        $scope.VoucherDailyOnline.ObjSearch.ToDateDisplay = $("#txtToDate").val();
        $scope.VoucherDailyOnline.ObjSearch.ToDate = moment(e.date).format('MM/DD/YYYY HH:mm');
        let StartDate = new Date($scope.VoucherDailyOnline.ObjSearch.FromDate);
        if (e.date._d.getTime() < StartDate.getTime()) {
            //e.date._d.setHours(0, 0, 0, 0);
            $('#txtFromDate').data("DateTimePicker").date(e.date);
        }
    });
    //$('#txtToDate').data("DateTimePicker").minDate(todate);
    //#endregion dtm

    //#region  search
    $scope.VoucherDailyOnline.btnExportExcel.OnClick = function () {
        ExportExcel();
    };
    //#endregion

    //#region enter search
    $(document).ready(function () {
        $(document).keypress(function (e) {
            if (e.which == 13) {
                ExportExcel();
            }
        });
    });
    //#endregion
    //#region function Export

    var ExportExcel = () => {
        let defer = $q.defer();
        //validate
        if ($scope.myroot.ddlStore.NodeResult.IDSelected.length == 0) {
            jAlert.Warning("Vui lòng chọn kho", "Thông báo");
            return;
        }
        if ($scope.VoucherDailyOnline.ObjSearch.FromDateDisplay == '' || $scope.VoucherDailyOnline.ObjSearch.ToDateDisplay == '') {
            jAlert.Warning('Vui lòng chọn khoảng thời gian tìm kiếm');
            return;
        }
        if ($scope.VoucherDailyOnline.NodeVoucherType.Result.LstIDSelected.length == 0) {
            jAlert.Warning("Vui lòng chọn hình thức thu chi", "Thông báo");
            return;
        }
        if ($scope.VoucherDailyOnline.NodePaymentType.Result.LstIDSelected.length == 0) {
            jAlert.Warning("Vui lòng chọn hình thức thanh toán", "Thông báo");
            return;
        }

        let obj = {};
        obj.DateFrom = $scope.VoucherDailyOnline.ObjSearch.FromDate;
        obj.DateTo = $scope.VoucherDailyOnline.ObjSearch.ToDate;
        obj.StoreIDs = $scope.myroot.ddlStore.NodeResult.IDSelected.filter(c => !c.includes('G_')).map(parseFloat); //ko submit những Id là Area
        obj.PaymentTypeIDs = $scope.VoucherDailyOnline.NodePaymentType.Result.LstIDSelected;
        obj.VoucherTypeIDs = $scope.VoucherDailyOnline.NodeVoucherType.Result.LstIDSelected;
        obj.UserID = !$scope.VoucherDailyOnline.ObjSearch.UserID ? -2 : $scope.VoucherDailyOnline.ObjSearch.UserID;
        UtilJS.Loading.Show();
        UtilJS.Files.Download({
            url: "/Online/DownloadVoucherDaily",
            data: obj,
            method: 'POST',
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
    //#region Popup search User
    $scope.PnUserSearchModal = {
        Core: {
            UserTypeSearch: 1,
            TotalColumn: 4
        }
    };
    $scope.PnUserSearchModal.CallBack = {};
    $scope.PnUserSearchModal.CallBack.ChoosedItem = function (User) {
        $scope.VoucherDailyOnline.ObjSearch.UserID = User.UserID;
        $scope.VoucherDailyOnline.ObjSearch.FullName = User.Username + " - " + User.FullName;

        $scope.PnUserSearchModal.API.HideModal();
    };

    $scope.PnUserSearchModal.Core.ReadAllData = true;
    $timeout(function () {
        $scope.PnVoucherDailyOnline.ShowUserSearch = function () {
            $scope.PnUserSearchModal.API.ShowModal();
            $scope.PnUserSearchModal.txtSearch.Text = "";
            $scope.PnUserSearchModal.API.Search();
        };
        $scope.PnVoucherDailyOnline.ClearUserInfo = function () {
            $scope.VoucherDailyOnline.ObjSearch.UserID = null;
            $scope.VoucherDailyOnline.ObjSearch.FullName = null;
        };
    });

    //#endregion

    //#region load data
    UtilJS.Loading.Show();
    $q.all({
        Stores: DataFactory.StoreTree_Read($scope.myroot.Permission.isReadStore),
        ProductCategories: DataFactory.ProductCategoriesTree_Read($scope.myroot.Permission.isReadCategory),
        PaymentTypes: DataFactory.PaymentTypes_Get(),
        VoucherTypes: DataFactory.VoucherTypes_Get(),
        wait: UtilFactory.WaitingLoadDirective([$scope.VoucherDailyOnline.NodePaymentType, $scope.VoucherDailyOnline.NodeVoucherType])
    }).then((MultipleRes) => {
        $scope.myroot.ddlStore.TreeData = MultipleRes.Stores.Data.filter(c => c.IsSaleStore);
        $scope.VoucherDailyOnline.NodePaymentType.Lst = MultipleRes.PaymentTypes.Data;
        $scope.VoucherDailyOnline.NodePaymentType.Lst.sort(function (a, b) {
            return a.PaymentTypeID - b.PaymentTypeID;
        });
        $scope.VoucherDailyOnline.NodePaymentType.API.SelectAll();
        $scope.VoucherDailyOnline.NodeVoucherType.Lst = MultipleRes.VoucherTypes.Data.filter(c => c.VoucherTypeID == 1 || c.VoucherTypeID == 2 || c.VoucherTypeID == 4);//Hinh thu = 1,2,4,24
        $scope.VoucherDailyOnline.NodeVoucherType.Lst.sort(function (a, b) {
            return a.VoucherTypeID - b.VoucherTypeID;
        });
        $scope.VoucherDailyOnline.NodeVoucherType.API.SelectAll();
        $scope.myroot.ddlUserProductCategory.TreeData = MultipleRes.ProductCategories.Data;
        UtilJS.Loading.Hide();
    }).catch((response) => {
        UtilJS.Loading.Hide();
        throw response;
    });
    //#endregion
}
VoucherDailyOnlineController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "ApiHelper", "UtilFactory", "DataFactory", "$q"];
addController("VoucherDailyOnlineController", VoucherDailyOnlineController);