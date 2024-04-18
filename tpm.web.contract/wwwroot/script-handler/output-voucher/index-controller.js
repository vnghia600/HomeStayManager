var inputorderlistcontroller = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory, $q) {
    var strSeachCS = "OutputSale.Read.CS";
    $scope.Permission = {
        SeachCS: $rootScope.UserPricinpal.IsInRole(strSeachCS)
        //SeachCS: true
    };
    $scope.OUTPV = {}
    $scope.OUTPV.LstOutputGroup = DataSetting.LstOutputGroup;
    $scope.OUTPV.FormSearch = { txtSearch: { Text: '' }, OutputTypeGroup: '1' };
    $scope.OUTPV.FormSearch.UserID = { Text: "", Value: null };
    $scope.OUTPV.FormSearch.Status = "-1";
    $scope.OUTPV.ddlStore = {};
    $scope.OUTPV.ddlStore.Lst = DataSetting.LstStoreRes;
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

    $scope.OUTPV.ddlOutputType = {};
    $scope.OUTPV.ddlOutputType.Lst = [];
    $scope.OUTPV.ddlOutputType.Core = {
        IsShowCheckboxAll: true,
        IsShowSearch: true,
        //IsCheckAll: true,
        Text: 'OutputTypeName',
        IDValue: 'OutputTypeID'
    }
    $scope.OUTPV.ddlOutputType.CallBack = {};
    $scope.OUTPV.ddlOutputType.CallBack.OnHiddenBsDropdown = function () {
    };
    $scope.OUTPV.ddlOutputType.CallBack.OnSelectedItem = function (item) {
        if ($scope.Permission.SeachCS) {
            $scope.OUTPV.ddlOutputType.Lst.forEach(function (o) {
                if (o.OutputTypeID == item.OutputTypeID)
                    return;
                o.IsChecked_ = false;
            });
            return;
        }
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

    //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Popup search customer
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
    //Popup search customer<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

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
        if ($scope.Permission.SeachCS && $scope.OUTPV.ddlOutputType.Result.LstIDSelected[0] == '1' && $scope.OUTPV.FormSearch.txtSearch.Text == '') {
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
            CreatedUser: null,
            OutputTypeIDs: $scope.OUTPV.ddlOutputType.Result.LstIDSelected,
            OutputStoreIDs: $scope.OUTPV.ddlStore.Result.LstIDSelected,
            PageIndex: intPage,
            PageSize: $scope.OUTPV.Pager.PageSize
        };

        CommonFactory.PostDataAjax("/OutputVoucher/Search", { Reqs: dataSend, OutputGroupID: $scope.OUTPV.FormSearch.OutputTypeGroup },
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
                    }
                }, 100);
            },
            function (error) {
                UtilJS.Loading.Hide();
            }
        );
    };

    $scope.OUTPV.btnExportExcel = function () {
        if ($scope.OUTPV.Lst.length == 0) {
            jAlert.Warning('Không có dữ liệu để xuất.');
            return;
        }
        if ($scope.OUTPV.FormSearch.dtmFrom == '' || $scope.OUTPV.FormSearch.dtmTo == '') {
            jAlert.Warning('Chọn khoảng thời export');
            return false;
        }

        var frm = $('<form action="/OutputVoucher/ExportExcel" method="POST"></form>');
        var input = '<input name="Reqs.KeySearch" value="' + $scope.OUTPV.FormSearch.txtSearch.Text + '">';
        input += '<input name="Reqs.CustomerID" value="-1">';

        if ($scope.OUTPV.FormSearch.dtmTo != "")
            input += '<input name="Reqs.OutputDateTo" value="' + $scope.OUTPV.FormSearch.dtmTo + '">';
        if ($scope.OUTPV.FormSearch.dtmFrom != "")
            input += '<input name="Reqs.OutputDateFrom" value="' + $scope.OUTPV.FormSearch.dtmFrom + '">';

        input += '<input name="OutputGroupID" value="' + $scope.OUTPV.FormSearch.OutputTypeGroup + '">';

        $(frm).append(input);
        for (var i = 0; i < $scope.OUTPV.ddlOutputType.Result.LstIDSelected.length; i++) {
            var element = '<input name="Reqs.OutputTypeIDs[]" value="' + $scope.OUTPV.ddlOutputType.Result.LstIDSelected[i] + '">';
            $(frm).append(element);
        }
        for (var i = 0; i < $scope.OUTPV.ddlStore.Result.LstIDSelected.length; i++) {
            var element = '<input name="Reqs.OutputStoreIDs[]" value="' + $scope.OUTPV.ddlStore.Result.LstIDSelected[i] + '">';
            $(frm).append(element);
        }
        $(frm).appendTo('body').submit().remove();
        return false;
    };

    $scope.OUTPV.GetOutputType = function () {
        var GroupID = parseInt($scope.OUTPV.FormSearch.OutputTypeGroup);
        $scope.OUTPV.ddlOutputType.Lst = DataSetting.LstOutputType.filter(function (item) {
            if (item.OutputGroupID == GroupID) {
                return true;
            }
            return false;
        });
    }
    $scope.OUTPV.GetOutputType();
    if ($scope.Permission.SeachCS) {
        $scope.OUTPV.ddlOutputType.Core.IsShowCheckboxAll = false;
    }
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
inputorderlistcontroller.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory", "$q"];
addController('inputorderlistcontroller', inputorderlistcontroller);
addDirective("customerSearchModal", customerSearchModal);