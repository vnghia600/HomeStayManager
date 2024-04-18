var transferscontroller = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory, $q, ApiHelper, DataFactory, $localstorage) {
    //#region declare variable
    $scope.OUTPV = {}
    $scope.OUTPV.FormSearch = { txtSearch: { Text: '' } };
    $scope.OUTPV.FormSearch.UserID = { Text: "", Value: null };
    $scope.OUTPV.FormSearch.Status = "-1";
    $scope.OUTPV.ddlStore = {};
    $scope.OUTPV.ddlStore.Lst = [];
    $scope.OUTPV.ddlStore.Core = {
        IsShowCheckboxAll: true,
        IsShowSearch: true,
        IsCheckAll: true,
        Text: 'StoreName',
        IDValue: 'StoreID'
    }
    $scope.OUTPV.ddlStore.CallBack = {};
    $scope.OUTPV.ddlStore.CallBack.OnHiddenBsDropdown = function () {
    };
    //#region select2
    $scope.OutputGroup = { Core: {}, CallBack: {} };
    $scope.OutputGroup.Core.Text = 'OutputGroup';
    $scope.OutputGroup.Core.IDValue = 'OutputGroupID';
    //#endregion

    $scope.OUTPV.ddlOutputType = {};
    $scope.OUTPV.ddlOutputType.Lst = [];
    $scope.OUTPV.ddlOutputType.Core = {
        IsShowCheckboxAll: true,
        IsShowSearch: true,
        Text: 'OutputTypeName',
        IDValue: 'OutputTypeID'
    }
    $scope.OUTPV.ddlOutputType.CallBack = {};
    $scope.OUTPV.ddlOutputType.CallBack.OnHiddenBsDropdown = function () {
    };
    $scope.OUTPV.ddlOutputType.CallBack.OnSelectedItem = function (item) {
        $scope.OUTPV.ddlOutputType.Lst.forEach(function (o) {
            if (o.OutputTypeID == item.OutputTypeID)
                return;
            o.IsChecked_ = false;
        });
        return;
    };

    $scope.OUTPV.Lst = [];
    $scope.OUTPV.Pager = { TotalItems: 0, PageSize: 10, CurrentPage: 1 };
    $scope.OUTPV.FormSearch.dtmFrom = '';
    $scope.OUTPV.FormSearch.dtmTo = '';
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var fromday = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    $('#dtmFrom').datetimepicker({
        format: 'DD/MM/YYYY HH:mm',
        showTodayButton: true,
        showClear: true,
        showClose: true,
        minDate: new Date(1, 0, 1990),
        defaultDate: fromday
    });
    $("#dtmFrom").on("dp.change", function (e) {
        if (!e.date) {
            $scope.OUTPV.FormSearch.dtmFromDisplay = '';
            $scope.OUTPV.FormSearch.dtmFrom = '';
            return;
        }
        $scope.OUTPV.FormSearch.dtmFromDisplay = moment(e.date).format('DD/MM/YYYY HH:mm');
        var strdate = moment(e.date).format('MM/DD/YYYY HH:mm');
        $scope.OUTPV.FormSearch.dtmFrom = strdate;
        $('#dtmTo').data("DateTimePicker").minDate(e.date);
    });
    $('#dtmTo').datetimepicker({
        format: 'DD/MM/YYYY HH:mm',
        showTodayButton: true,
        showClear: true,
        showClose: true,
        minDate: new Date(1, 1, 1990),
        defaultDate: today
    });
    $("#dtmTo").on("dp.change", function (e) {
        if (!e.date) {
            $scope.OUTPV.FormSearch.dtmToDisplay = '';
            $scope.OUTPV.FormSearch.dtmTo = '';
            return;
        }
        $scope.OUTPV.FormSearch.dtmToDisplay = moment(e.date).format('DD/MM/YYYY HH:mm');
        var strdate = moment(e.date).format('MM/DD/YYYY HH:mm');
        $scope.OUTPV.FormSearch.dtmTo = strdate;
        $('#dtmFrom').data("DateTimePicker").maxDate(e.date);
    });

    let strfromday = moment(fromday).format('DD/MM/YYYY 00:00');
    let strtoday = moment(today).format('DD/MM/YYYY 23:59');

    $scope.OUTPV.FormSearch.dtmFromDisplay = strfromday;
    $scope.OUTPV.FormSearch.dtmToDisplay = strtoday;

    $scope.OUTPV.FormSearch.dtmFrom = moment(fromday).format('MM/DD/YYYY 00:00');
    $scope.OUTPV.FormSearch.dtmTo = moment(today).format('MM/DD/YYYY 23:59');

    $('#dtmPayment').datetimepicker({
        format: 'DD/MM/YYYY',
        showTodayButton: true,
        showClear: true,
        showClose: true,
        minDate: new Date(1, 1, 1990),
        useCurrent: false
    });
    $("#dtmPayment").on("dp.change", function (e) {
        $scope.OUTPV.FormSearch.dtmPaymentDisplay = $('#dtmPayment').val();
        var str_date = moment(e.date).format('MM/DD/YYYY');
        $scope.OUTPV.FormSearch.dtmPayment = str_date;
    });
    //#endregion
    //#region Popup search customer
    $scope.PnCustomerSearchModal = {};
    $scope.PnCustomerSearchModal.CallBack = {
        ChoosedItem: function (item) {
            $scope.OUTPV.FormSearch.UserID.Value = item.CustomerID;
            $scope.OUTPV.FormSearch.UserID.Text = item.CustomerName;
            $scope.PnCustomerSearchModal.API.HideModal();
        }
    };
    $scope.OUTPV.ShowSearchCustomer = function () {
        $scope.PnCustomerSearchModal.API.ShowModal();
        $scope.PnCustomerSearchModal.Core.txtSearch.Text = "";
    };
    $scope.OUTPV.ClearSearchCustomer = function () {
        $scope.OUTPV.FormSearch.UserID.Text = '';
        $scope.OUTPV.FormSearch.UserID.Value = null;
    };
    //#endregion search customer

    //#region search
    $scope.OUTPV.btnSearch = {};
    $scope.OUTPV.btnSearch.OnClick = function () {
        if ($scope.OUTPV.FormSearch.dtmFrom == '' || $scope.OUTPV.FormSearch.dtmTo == '') {
            jAlert.Warning('Chọn khoảng thời gian tìm kiếm');
            return false;
        }
        if ($scope.OUTPV.ddlOutputType.Result.LstIDSelected.length == 0) {
            jAlert.Warning('Vui lòng chọn hình thức xuất');
            event.preventDefault();
            return false;
        }
        if ($scope.OUTPV.ddlStore.Result.LstIDSelected.length == 0) {
            jAlert.Warning('Vui lòng chọn kho xuất');
            return false;
        }
        if ($scope.OUTPV.ddlOutputType.Result.LstIDSelected[0] == '1' && $scope.OUTPV.FormSearch.txtSearch.Text == '') {
            jAlert.Warning('Vui lòng nhập mã phiếu nhập');
            return false;
        }
        $scope.OUTPV.Search();
    };
    $scope.OUTPV.Search = function (intPage) {
        intPage = !intPage ? 1 : intPage;
        UtilJS.Loading.Show();
        var dataSend = {
            KeySearch: $scope.OUTPV.FormSearch.txtSearch.Text,
            CustomerID: -1,
            OutputDateFrom: $scope.OUTPV.FormSearch.dtmFrom,
            OutputDateTo: $scope.OUTPV.FormSearch.dtmTo,
            CreatedUser: -1,
            OutputTypeIDs: $scope.OUTPV.ddlOutputType.Result.LstIDSelected,
            OutputStoreIDs: $scope.OUTPV.ddlStore.Result.LstIDSelected,
            PageIndex: intPage,
            PageSize: $scope.OUTPV.Pager.PageSize
        };

        //let strApiEndPoint = ApiEndPoint.OutputTransfersResource + "Search";
        //ApiHelper.PostMethod(strApiEndPoint, dataSend)
        //    .then(function (response) {
        //        UtilJS.Loading.Hide();
        //        $scope.OUTPV.Lst = response.Data.Records || [];
        //        $scope.OUTPV.Pager.TotalItems = response.Data.TotalRecord || 0;
        //        $scope.OUTPV.Pager.CurrentPage = intPage;
        //        $scope.ObjExcel = dataSend;
        //    })
        //    .catch(function (response) {
        //        jAlert.Notify(response);
        //        $scope.OUTPV.Lst = [];
        //        $scope.OUTPV.Pager.TotalItems = 0;
        //        UtilJS.Loading.Hide();
        //    });

        CommonFactory.PostDataAjax("/OutputVoucher/SearchTransfers", { Reqs: dataSend },
            function (beforeSend) { },
            function (response) {
                $timeout(function () {
                    UtilJS.Loading.Hide();
                    $scope.OUTPV.Lst = [];
                    $scope.OUTPV.Pager.TotalItems = 0;
                    if (response.objCodeStep.Status == 'Error') {
                        jAlert.Error(response.objCodeStep.Message, 'Thông báo');
                    }
                    if (response.objCodeStep.Status == 'Warning') {
                        jAlert.Warning(response.objCodeStep.Message, 'Thông báo');
                    }
                    if (response.objCodeStep.Status == 'Success') {
                        $scope.OUTPV.Lst = response.objCodeStep.Data.Records || [];
                        $scope.OUTPV.Pager.TotalItems = response.objCodeStep.Data.TotalRecord || 0;
                        $scope.OUTPV.Pager.CurrentPage = intPage;

                        $scope.ObjExcel = dataSend;
                    }
                }, 100);
            },
            function (error) {
                UtilJS.Loading.Hide();
            }
        );
    };
    //#endregion

    //#region Export excel
    $scope.OUTPV.btnExportExcel = function () {
        if ($scope.OUTPV.Lst.length == 0) {
            jAlert.Warning('Không có dữ liệu để xuất.');
            return;
        }
        if ($scope.OUTPV.FormSearch.dtmFrom == '' || $scope.OUTPV.FormSearch.dtmTo == '') {
            jAlert.Warning('Chọn khoảng thời export');
            return false;
        }
        let _ObjExcel = $scope.ObjExcel;
        UtilJS.Files.Download({
            url: "/OutputVoucher/ExportExcel",
            data: { Reqs: _ObjExcel, OutputGroupID: OutputGroupEnum.LuanChuyen},
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
        //var frm = $('<form action="/OutputVoucher/ExportExcel" method="POST"></form>');
        //var input = '<input name="Reqs.KeySearch" value="' + $scope.OUTPV.FormSearch.txtSearch.Text + '">';
        //input += '<input name="Reqs.CustomerID" value="-1">';

        //if ($scope.OUTPV.FormSearch.dtmTo != "")
        //    input += '<input name="Reqs.OutputDateTo" value="' + $scope.OUTPV.FormSearch.dtmTo + '">';
        //if ($scope.OUTPV.FormSearch.dtmFrom != "")
        //    input += '<input name="Reqs.OutputDateFrom" value="' + $scope.OUTPV.FormSearch.dtmFrom + '">';

        //input += '<input name="OutputGroupID" value="' + $scope.OutputGroup.Value + '">';

        //$(frm).append(input);
        //for (var i = 0; i < $scope.OUTPV.ddlOutputType.Result.LstIDSelected.length; i++) {
        //    var element = '<input name="Reqs.OutputTypeIDs[]" value="' + $scope.OUTPV.ddlOutputType.Result.LstIDSelected[i] + '">';
        //    $(frm).append(element);
        //}
        //for (var i = 0; i < $scope.OUTPV.ddlStore.Result.LstIDSelected.length; i++) {
        //    var element = '<input name="Reqs.OutputStoreIDs[]" value="' + $scope.OUTPV.ddlStore.Result.LstIDSelected[i] + '">';
        //    $(frm).append(element);
        //}
        //$(frm).appendTo('body').submit().remove();
        //return false;
    };
    //#endregion

    UtilJS.Loading.Show();
    $q.all({
        OutputTypes: DataFactory.OutputTypes_Get(),
        OutputGroups: DataFactory.OutputGroups_Get(),
        UserStores: DataFactory.UserStores_Get(),
        wait: UtilFactory.WaitingLoadDirective([$scope.OutputGroup])
    }).then((Multiples) => {
        //filter như trong controller: OutputGroupID = LuanChuyen
        $scope.OutputGroup.Lst = Multiples.OutputGroups.Data
            .filter(c => c.OutputGroupID == OutputGroupEnum.LuanChuyen);
        $scope.OutputGroup.API.SetValue(OutputGroupEnum.LuanChuyen);
        //filter như trong controller: OutputTypeID = Xuatbantructiep || OutputTypeID = XuatBanHangOnline || OutputTypeID = XuatChuyenKhoNoiBo, OutputGroupID = LuanChuyen
        $scope.OUTPV.ddlOutputType.Lst = Multiples.OutputTypes.Data
            .filter(c => (c.OutputTypeID == OutputTypeEnum.Xuatbantructiep || c.OutputTypeID == OutputTypeEnum.XuatBanHangOnline || c.OutputTypeID == OutputTypeEnum.XuatChuyenKhoNoiBo) && c.OutputGroupID == OutputGroupEnum.LuanChuyen);
        $scope.OUTPV.ddlStore.Lst = Multiples.UserStores.Data;
        $scope.OUTPV.ddlStore.API.SelectAll();

        $timeout(() => { $rootScope.IsLoadPage = true; }, 0);
        UtilJS.Loading.Hide();
     });
    //#region enter search
    $(document).ready(function () {
        $(document).keypress(function (e) {
            if (e.which == 13) {
                $scope.OUTPV.btnSearch.OnClick();
            }
        });
    });
    //#endregion
}
transferscontroller.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory", "$q", "ApiHelper", "DataFactory", "$localstorage"];
addController('transferscontroller', transferscontroller);
//addDirective("customerSearchModal", customerSearchModal);