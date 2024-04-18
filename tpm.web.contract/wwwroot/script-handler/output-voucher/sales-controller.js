var salescontroller = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory, $q, ApiHelper, DataFactory, $localstorage) {
    //#region declare variable
    var strSeachCS = "OutputSale.Read.CS";
    var strIsDelete = "OutputSale.Delete";
    $scope.Permission = {
        SeachCS: $rootScope.UserPricinpal.IsInRole(strSeachCS),
        IsDelete: $rootScope.UserPricinpal.IsInRole(strIsDelete)
    };
    $scope.myroot = {};



    $scope.checkDate = function (item) {
        if (item.IsNotOutputEInvoice) {
            return false;
        }

        var re = /-?\d+/;
        var m = re.exec(item.CreatedDate);
        var d = new Date(parseInt(m[0]));
        let strDay = moment(d).format('DDMMYYYY');

        let today = new Date();
        let strToday = moment(today.date).format('DDMMYYYY');
        if (strDay === strToday)
            return true;
        return false;
    };

    $scope.OUTPV = {};
    $scope.OUTPV.LstOutputGroup = [];
    $scope.OUTPV.FormSearch = { txtSearch: { Text: '' } };
    $scope.OUTPV.FormSearch.UserID = { Text: "", Value: null };
    $scope.OUTPV.FormSearch.Status = "-1";
    $scope.OUTPV.FormSearch.SearchID = "1";
    $scope.OUTPV.ddlStore = {};
    $scope.OUTPV.ddlStore.Lst = [];
    $scope.OUTPV.ddlStore.Core = {
        IsShowCheckboxAll: true,
        IsShowSearch: true,
        IsCheckAll: true,
        Text: 'StoreName',
        IDValue: 'StoreID'
    };
    $scope.OUTPV.ddlStore.CallBack = {};
    $scope.OUTPV.ddlStore.CallBack.OnHiddenBsDropdown = function () {
    };

    //#region select2
    $scope.OutputGroup = { Core: {}, CallBack: {} };
    $scope.OutputGroup.Core.Text = 'OutputGroup';
    $scope.OutputGroup.Core.IDValue = 'OutputGroupID';
    //#endregion

    $scope.SearchID = {};
    $scope.SearchID.OnChange = function () {
        $scope.OUTPV.FormSearch.txtSearch.Text = "";
        $scope.myroot.PID = null;
        $scope.myroot.ProductName = null;
        $scope.myroot.CustomerID = null;
        $scope.myroot.CustomerName = null;
    };

    $scope.OUTPV.ddlOutputType = {};
    $scope.OUTPV.ddlOutputType.Lst = [];
    $scope.OUTPV.ddlOutputType.Core = {
        IsShowCheckboxAll: true,
        IsShowSearch: true,
        IsCheckAll: true,
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
    today.setHours(23, 59, 59);
    var fromday = new Date();
    fromday.setHours(0, 0, 0, 0);

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
        e.date._d.setHours(0, 0, 0, 0);
        $scope.OUTPV.FormSearch.dtmFromDisplay = moment(e.date).format('DD/MM/YYYY HH:mm');
        var strdate = moment(e.date).format('MM/DD/YYYY HH:mm');
        $scope.OUTPV.FormSearch.dtmFrom = strdate;
        let EndDate = new Date($scope.OUTPV.FormSearch.dtmTo);
        if (e.date._d.getTime() > EndDate.getTime()) {
            e.date._d.setHours(23, 59, 0, 0);
            $('#dtmTo').data("DateTimePicker").date(e.date);
        }
        e.date._d.setHours(23, 59, 0, 0);
        var _newMaxDay = new Date(e.date);
        var _maxDay = new Date(_newMaxDay.getFullYear(), _newMaxDay.getMonth() + 1, _newMaxDay.getDate());
        $('#dtmTo').data("DateTimePicker").minDate(e.date);
        $('#dtmTo').data("DateTimePicker").maxDate(_maxDay);
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
        e.date._d.setHours(23, 59, 0, 0);
        $('#dtmFrom').data("DateTimePicker").maxDate(e.date);
        let _dayFrom = new Date($scope.OUTPV.FormSearch.dtmFrom);
        var _minDay = new Date(_dayFrom.getFullYear(), _dayFrom.getMonth() + 1, _dayFrom.getDate());
        if (e.date._d.getTime() > _minDay.getTime()) {
            e.date._d.setHours(0, 0, 0, 0);
            var _newMinDay = new Date(e.date);
            _minDay = new Date(_newMinDay.getFullYear(), _newMinDay.getMonth() - 1, _newMinDay.getDate());
            $('#dtmFrom').data("DateTimePicker").date(_minDay);
        }
    });

    let strfromday = moment(fromday).format('DD/MM/YYYY 00:00');
    let strtoday = moment(today).format('DD/MM/YYYY 23:59');

    $scope.OUTPV.FormSearch.dtmFromDisplay = strfromday;
    $scope.OUTPV.FormSearch.dtmToDisplay = strtoday;

    $scope.OUTPV.FormSearch.dtmFrom = moment(fromday).format('MM/DD/YYYY 00:00');
    $scope.OUTPV.FormSearch.dtmTo = moment(today).format('MM/DD/YYYY 23:59');

    //$('#dtmPayment').datetimepicker({
    //    format: 'DD/MM/YYYY',
    //    showTodayButton: true,
    //    showClear: true,
    //    showClose: true,
    //    useCurrent: false,
    //});
    //$("#dtmPayment").on("dp.change", function (e) {
    //    $scope.OUTPV.FormSearch.dtmPaymentDisplay = $('#dtmPayment').val();
    //    var str_date = moment(e.date).format('MM/DD/YYYY');
    //    $scope.OUTPV.FormSearch.dtmPayment = str_date;
    //});
    //#endregion
    //#region Popup search customer
    $scope.PnCustomerSearchModal = {};
    $scope.PnCustomerSearchModal.CallBack = {
        ChoosedItem: function (item) {
            $scope.myroot.CustomerID = item.CustomerID;
            $scope.myroot.CustomerName = item.CustomerName;
            $scope.PnCustomerSearchModal.API.HideModal();
        }
    };
    $scope.myroot.ShowCustomerSearchModal = function () {
        $scope.PnCustomerSearchModal.API.ShowModal();
        $scope.PnCustomerSearchModal.Core.txtSearch.Text = "";
    };
    $scope.myroot.ClearCustomerInfo = function () {
        $scope.myroot.CustomerID = null;
        $scope.myroot.CustomerName = null;
    };
    //#endregion search customer

    //#region products search
    $scope.PnProductSearchModal = {};
    $scope.PnProductSearchModal.Core = {};
    $scope.PnProductSearchModal.Core.treePlugins = "checkbox,search,chkall";
    $scope.PnProductSearchModal.CallBack = {};
    $scope.PnProductSearchModal.Core.IsShowCategory = true;
    $scope.PnProductSearchModal.Core.LstUserProductCategoryTree = DataSetting.TreeCategory;
    $scope.PnProductSearchModal.ddlUserProductCategory = { IDSelectedTimeOut: false, IsSelectedAll: true };
    //UserProductCategoryFactory.FilterCategoryByParentID(
    //    DataSetting.LstUserProductCategoryTree,
    //    "534",//Lấy danh sách trong thưởng ngành hàng
    //    $scope.PnProductSearchModal.Core.LstUserProductCategoryTree
    //);

    $timeout(function () {
        $scope.myroot.ShowProductSearchModal = function () {
            $scope.PnProductSearchModal.Core.BusinessType = 'OutputStore';
            let strPayFormCreate = "UserProductCategory.Read.All";
            if ($rootScope.UserPricinpal.IsInRole(strPayFormCreate)) {
                $scope.PnProductSearchModal.Core.IsPermission_AllCategories = true;
            }
            else {
                $scope.PnProductSearchModal.Core.IsPermission_AllCategories = false;
            }
            $scope.PnProductSearchModal.API.ResetModal();
            $scope.PnProductSearchModal.API.ShowModal();
        };
        $scope.myroot.ClearProductInfo = function () {
            $scope.myroot.PID = null;
            $scope.myroot.ProductName = null;
        };
    });

    $scope.PnProductSearchModal.CallBack = {};

    $scope.PnProductSearchModal.CallBack.ChoosedItem = function (Product) {
        $scope.myroot.PID = Product.PID;
        $scope.myroot.ProductName = Product.ProductName;

        $scope.PnProductSearchModal.API.HideModal();
    };

    //#endregion

    //#region search
    $scope.OUTPV.btnSearch = {};
    $scope.OUTPV.btnExportExcel = {};
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
        if ($scope.OUTPV.FormSearch.SearchID == 1 && $scope.Permission.SeachCS && $scope.OUTPV.ddlOutputType.Result.LstIDSelected[0] == '1' && $scope.OUTPV.FormSearch.txtSearch.Text == '') {
            jAlert.Warning('Vui lòng nhập mã phiếu xuất');
            return false;
        }
        if ($scope.OUTPV.FormSearch.SearchID == 2 && !$scope.myroot.PID) {
            jAlert.Warning('Vui lòng chọn sản phẩm');
            return false;
        }

        if ($scope.OUTPV.FormSearch.SearchID == 3 && !$scope.myroot.CustomerID) {
            jAlert.Warning('Vui lòng chọn khách hàng');
            return false;
        }

        $scope.OUTPV.Search();
    };
    $scope.OUTPV.Search = function (intPage) {
        intPage = !intPage ? 1 : intPage;
        UtilJS.Loading.Show();
        var dataSend = {
            KeySearch: $scope.OUTPV.FormSearch.txtSearch.Text,
            Option: $scope.OUTPV.FormSearch.SearchID,//NEW
            PID: !$scope.myroot.PID ? 0 : $scope.myroot.PID,
            CustomerID: !$scope.myroot.CustomerID ? 0 : $scope.myroot.CustomerID,
            OutputDateFrom: $scope.OUTPV.FormSearch.dtmFrom,
            OutputDateTo: $scope.OUTPV.FormSearch.dtmTo,
            CreatedUser: -1,
            OutputTypeIDs: $scope.OUTPV.ddlOutputType.Result.LstIDSelected,
            OutputStoreIDs: $scope.OUTPV.ddlStore.Result.LstIDSelected,
            PageIndex: intPage,
            PageSize: $scope.OUTPV.Pager.PageSize
        };

        //let strApiEndPoint = ApiEndPoint.OutputSalesResource + "Search";
        //if ($scope.Permission.SeachCS)
        //    strApiEndPoint = ApiEndPoint.OutputSalesResource + "SearchCS";
        //let strApiEndPoint = '/OutputSales/SearchSales';
        //ApiHelper.PostMethod(strApiEndPoint, dataSend)
        //    .then(function (response) {
        //        UtilJS.Loading.Hide();
        //        $scope.OUTPV.Lst = response.Data.Records || [];
        //        $scope.OUTPV.TotalAmountAll = response.Data.Records.length > 0 ? response.Data.Records[0].TotalAmountAll : 0;
        //        $scope.OUTPV.Pager.TotalItems = response.Data.TotalRecord || 0;
        //        $scope.OUTPV.Pager.CurrentPage = intPage;
        //    })
        //    .catch(function (response) {
        //        jAlert.Notify(response);
        //        $scope.OUTPV.Lst = [];
        //        $scope.OUTPV.Pager.TotalItems = 0;
        //        UtilJS.Loading.Hide();
        //    });

        CommonFactory.PostDataAjax("/OutputVoucher/SearchSales", dataSend,
            function (beforeSend) { },
            function (response) {
                $timeout(function () {
                    UtilJS.Loading.Hide();
                    $scope.OUTPV.Lst = [];
                    if (response.objCodeStep.Status == jAlert.Status.Error) {
                        jAlert.Error(response.objCodeStep.Message, 'Thông báo');
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Warning) {
                        jAlert.Warning(response.objCodeStep.Message, 'Thông báo');
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Success) {
                        UtilJS.Loading.Hide();
                        $scope.OUTPV.Lst = response.objCodeStep.Data.Records || [];
                        $scope.OUTPV.TotalAmountAll = response.objCodeStep.Data.Records.length > 0 ? response.objCodeStep.Data.Records[0].TotalAmountAll : 0;
                        $scope.OUTPV.Pager.TotalItems = response.objCodeStep.Data.TotalRecord || 0;
                        $scope.OUTPV.Pager.CurrentPage = intPage;
                    }
                });
            },
            function (error) {
                UtilJS.Loading.Hide();
            }
        );

    };
    //#endregion

    //#region Export excel
    $scope.OUTPV.btnExportExcel.OnClick = function () {
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
        if ($scope.OUTPV.FormSearch.SearchID == 1 && $scope.Permission.SeachCS && $scope.OUTPV.ddlOutputType.Result.LstIDSelected[0] == '1' && $scope.OUTPV.FormSearch.txtSearch.Text == '') {
            jAlert.Warning('Vui lòng nhập mã phiếu xuất');
            return false;
        }
        if ($scope.OUTPV.FormSearch.SearchID == 2 && !$scope.myroot.PID) {
            jAlert.Warning('Vui lòng chọn sản phẩm');
            return false;
        }

        if ($scope.OUTPV.FormSearch.SearchID == 3 && !$scope.myroot.CustomerID) {
            jAlert.Warning('Vui lòng chọn khách hàng');
            return false;
        }
        if ($scope.OUTPV.Lst.length == 0) {
            jAlert.Warning('Không có dữ liệu để xuất.');
            return;
        }

        var dataSend = {
            KeySearch: $scope.OUTPV.FormSearch.txtSearch.Text,
            Option: $scope.OUTPV.FormSearch.SearchID,//NEW
            PID: !$scope.myroot.PID ? 0 : $scope.myroot.PID,
            CustomerID: !$scope.myroot.CustomerID ? 0 : $scope.myroot.CustomerID,
            OutputDateFrom: $scope.OUTPV.FormSearch.dtmFrom,
            OutputDateTo: $scope.OUTPV.FormSearch.dtmTo,
            CreatedUser: -1,
            OutputTypeIDs: $scope.OUTPV.ddlOutputType.Result.LstIDSelected,
            OutputStoreIDs: $scope.OUTPV.ddlStore.Result.LstIDSelected,
            PageIndex: -1,
            PageSize: -1
        };
        UtilJS.Files.Download({
            url: "/OutputVoucher/ExportExcel",
            data: { Reqs: dataSend, OutputGroupID: InputGroupEnum.BanHang },
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

    //#region Delete
    $scope.Delete = function (OID) {
        jConfirm('Thông báo', 'Bạn có chắc muốn xóa?', function (isOK) {
            if (!isOK)
                return;
            UtilJS.Loading.Show();
            let dataSend = {};
            CommonFactory.PostDataAjax("/OutputVoucher/DeleteSales?id=" + OID, dataSend,
                function (beforeSend) { },
                function (response) {
                    $timeout(function () {
                        UtilJS.Loading.Hide();
                        if (response.objCodeStep.Status == jAlert.Status.Error) {
                            jAlert.Error(response.objCodeStep.Message, 'Thông báo');
                        }
                        else if (response.objCodeStep.Status == jAlert.Status.Warning) {
                            jAlert.Warning(response.objCodeStep.Message, 'Thông báo');
                        }
                        else if (response.objCodeStep.Status == jAlert.Status.Success) {
                            jAlert.Notify(response.objCodeStep);
                            $scope.OUTPV.Search();
                        }
                    });
                },
                function (error) {
                    UtilJS.Loading.Hide();
                }
            );
        });
    };

    //#endregion
    if ($scope.Permission.SeachCS) {
        $scope.OUTPV.ddlOutputType.Core.IsShowCheckboxAll = false;
    }
    UtilJS.Loading.Show();
    $q.all({
        OutputTypes: DataFactory.OutputTypes_Get(),
        OutputGroups: DataFactory.OutputGroups_Get(),
        UserStores: DataFactory.UserStores_Get(),
        Stores: DataFactory.Stores_Get(),
        wait: UtilFactory.WaitingLoadDirective([$scope.OutputGroup])
    }).then((Multiples) => {
        //filter như trong controller: OutputGroupID = BanHang
        $scope.OutputGroup.Lst = Multiples.OutputGroups.Data
            .filter(c => c.OutputGroupID == OutputGroupEnum.BanHang);
        $scope.OutputGroup.API.SetValue(OutputGroupEnum.BanHang);
        //filter như trong controller: OutputTypeID = Xuatbantructiep || OutputTypeID = XuatBanHangOnline || OutputTypeID = XuatChuyenKhoNoiBo, OutputGroupID = BanHang
        $scope.OUTPV.ddlOutputType.Lst = Multiples.OutputTypes.Data
            .filter(c => (c.OutputTypeID == OutputTypeEnum.Xuatbantructiep || c.OutputTypeID == OutputTypeEnum.XuatBanHangOnline || c.OutputTypeID == OutputTypeEnum.XuatChuyenKhoNoiBo) && c.OutputGroupID == OutputGroupEnum.BanHang);
        $scope.OUTPV.ddlOutputType.API.SelectAll();
        $scope.OUTPV.ddlStore.Lst = Multiples.UserStores.Data;
        if ($rootScope.UserPricinpal.IsInRole("OutputSale.Read.AllStores")) {
            $scope.OUTPV.ddlStore.Lst = Multiples.Stores.Data;
        }
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
salescontroller.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory", "$q", "ApiHelper", "DataFactory", "$localstorage"];
addController('salescontroller', salescontroller);
