var OutputSalesDetailController = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory, $localstorage, UserProductCategoryFactory) {

    //#region declare variable
    $scope.objOutput = {};
    $scope.objOutput = DataSetting.objOutputTransfer;
    $scope.LstOutputTypes = DataSetting.LstOutputTypeRes;
    $scope.LstPaymentTypes = DataSetting.LstPaymentTypes;
    $scope.objOutput.OutputStoreID = $scope.objOutput.OutputStoreID.toString();
    $scope.objOutput.OutputTypeID = $scope.objOutput.OutputTypeID.toString();
    $scope.objOutput.PaymentTypeID = $scope.objOutput.PaymentTypeID == null ? "-1" : $scope.objOutput.PaymentTypeID.toString();
    $scope.PnProduct = { Lst: [], Pager: { TotalItems: 0, PageSize: 10, CurrentPage: 1 } };
    //#endregion

    //#region load data
    $timeout(function () {
        $scope.PnProduct.Lst = $scope.objOutput.OutputTransferDetails;
        $scope.PnProduct.Pager.TotalItems = $scope.objOutput.OutputTransferDetails.length;
    }, 100);
    //#endregion

    //#region paging
    $scope.PnProduct.Search = function (intPage) {
        intPage = !intPage ? 1 : intPage;
        $scope.PnProduct.Pager.CurrentPage = intPage;
    };
    //#endregion

    //#region sum footer 
    $scope.$watch('PnProduct.Lst', function (n, o) {
        $scope.PnProduct.Lst.forEach(function (item) {
            //$scope.objOutput.TotalQuantity += item.Quantity;//tong so luong
            //$scope.objOutput.TotalTaxAmount += item.TaxAmount;//tong tien thue
            //$scope.objOutput.TotalAmount += item.PriceAmount;//tong tien TT
            $scope.objOutput.TotalDiscount = $scope.objOutput.TotalAmount - $scope.objOutput.TotalTaxAmount;//tong tien hang
        });
    }, true);
    //#endregion
}
OutputSalesDetailController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory", "$localstorage"];
addController("OutputSalesDetailController", OutputSalesDetailController);