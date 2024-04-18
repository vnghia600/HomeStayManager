var EditController = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory, $q, ApiHelper, DataFactory) {
    let OutputFastSalesEndPoint = "/OutputFastSales/";
    $scope.Permission = {
        Cancel: $rootScope.UserPricinpal.IsInRole("OutputFastSale.Cancel.CRMPartner")
    };
    UtilJS.Loading.Show();
    $q.all({
        wait: UtilFactory.WaitingLoadDirective([
        ])
    }).then((Multiples) => {
        $timeout(() => { $rootScope.IsLoadPage = true; }, 0);
        UtilJS.Loading.Hide();
    });

    $scope.objOSFO = DataSetting.objOSFO;
    if ($scope.objOSFO.InvoiceTax) {
        $scope.objOSFO.TaxNo_Personal = $scope.objOSFO.InvoiceTax.substring(0, 10);
        if ($scope.objOSFO.InvoiceTax.includes('-')) {
            $scope.objOSFO.TaxNo_Company = $scope.objOSFO.InvoiceTax.split("-")[1];
        }                       
    }
    if ($scope.objOSFO.CustomerPhone) {
        $scope.objOSFO.CustomerPhone = '0' + $scope.objOSFO.CustomerPhone;
    }
    if ($scope.objOSFO.ContactPhone) {
        $scope.objOSFO.ContactPhone = '0' + $scope.objOSFO.ContactPhone;
    }
    if ($scope.objOSFO.ConfirmedUserName) {
        $scope.objOSFO.ConfirmedFullName = $scope.objOSFO.ConfirmedUserName + '' + $scope.objOSFO.ConfirmedFullName;
    }
    $scope.ShowPopupCancel_OnClick = function () {
        $(".frmPopupCancel").modal('show');
    };

    $scope.PnProduct = {
        Lst: [], Pager: { TotalItems: 0, PageSize: 10, CurrentPage: 1 },
        txtNewProductID: { Text: '' },
        btnShowImportExcel: {}
    };
    $scope.PnProduct.Lst = $scope.objOSFO.Details.filter((x) => !x.IsDelivery);
    $scope.objOSFO.TotalAmountOrder = 0;
    $scope.PnProduct.Lst.forEach((item) => {
        if (!item.IsDelivery) {
            $scope.objOSFO.TotalAmountOrder += item.QuotedPrice * item.Quantity;
        }
    });

    $scope.PnProduct.Paging = function (intPage) {
        intPage = !intPage ? 1 : intPage;
        $scope.PnProduct.Pager.CurrentPage = intPage;
    };

    $scope.CheckShowPopupCancel = function () {
        return $scope.objOSFO.OutputFastStatusID <= 2 && ($rootScope.UserPricinpal.UserID == $scope.objOSFO.CreatedUser || $scope.Permission.Cancel);
    };

    $scope.objOutputFastRevokeType = {};
    $scope.btnCancel_OnClick = function () {
        if (!$('#frmPopupCancel').valid()) {
            $rootScope.scrollToTopInputValid();
            return;
        }
        jConfirm('Thông báo', 'Bạn có chắc muốn hủy phiếu?', function (isOK) {
            if (isOK) {
                let objReqCancel = {};
                objReqCancel.RevokeTypeName = $scope.objOutputFastRevokeType.RevokeTypeName;
                objReqCancel.OFSID = $scope.objOSFO.OFSID;
                OutputFastSales_Cancel(objReqCancel).then(() => {
                    window.location.reload();
                }).catch((response) => {
                    UtilJS.Loading.Hide();
                    jAlert.Error(response.Message);
                });
            }
        });
    };
    var OutputFastSales_Cancel = (objReq) => {
        let defer = $q.defer();
        var url = "/OutputFastSales/Cancel";
        UtilJS.Loading.Show();
        CommonFactory.PostMethod(url, objReq)
            .then((response) => {
                return defer.resolve(response.objCodeStep);
            })
            .catch((response) => {
                return defer.reject(response.objCodeStep);
            });
        return defer.promise;
    };
    $scope.ShowCustomerInvoice = function () {
        $(".frmInvoice").modal('show');
    };
    $(function () {
        //customValidate.SetForm('HeaderForm', '');
        customValidate.SetForm('frmPopupCancel', '');
    });
};
EditController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory", "$q", "ApiHelper", "DataFactory"];
addController("EditController", EditController);
