var OutputSalesDetailController = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory, $localstorage, UserProductCategoryFactory) {
    //#region declare variable
    $scope.objOutput = {};
    $scope.objOutput = DataSetting.objOutputSale;
    $scope.LstOutputTypes = DataSetting.LstOutputTypeRes;
    $scope.LstPaymentTypes = DataSetting.LstPaymentTypes;
    //$scope.objOutput.OutputStoreID = $scope.objOutput.OutputStoreID.toString();
    $scope.objOutput.OutputTypeID = $scope.objOutput.OutputTypeID.toString();
    $scope.objOutput.PaymentTypeID = $scope.objOutput.PaymentTypeID == null ? "-1" : $scope.objOutput.PaymentTypeID.toString();
    $scope.PnProduct = { Lst: [], Pager: { TotalItems: 0, PageSize: 10, CurrentPage: 1 } };
    //#endregion

    //#region load data
    $timeout(function () { 
        $scope.PnProduct.Lst = $scope.objOutput.OutputSaleDetails;
        $scope.PnProduct.Lst.filter((x) => {
            let ProductName1 = x.ProductName.substring(0, 1).normalize();
            ProductName1 = ProductName1.toLowerCase();
            x.ProductName1 = UtilJS.String.RemoveUnicode(ProductName1);
        }); 
        //**** Định confirm k cần sort ****//
        $scope.PnProduct.Lst = _($scope.PnProduct.Lst).chain()
            .sortBy(function (patient) {
                return patient.CreatedDate;
            }).value();
            //.sortBy(function (patient) {
            //    return patient.ProductName1;
            //}).value();
         
        //$scope.PnProduct.Lst = $scope.PnProduct.Lst.sort((a, b) => {
        //    let ProductName1 = a.ProductName.substring(0, 1).normalize();
        //    ProductName1 = ProductName1.toLowerCase();

        //    let ProductName2 = b.ProductName.substring(0, 1).normalize();
        //    ProductName2 = ProductName2.toLowerCase();

        //    var o1 = ProductName1;
        //    var o2 = ProductName1;

        //    var p1 = a.PriceAmount;
        //    var p2 = b.PriceAmount;

        //    if (o1 < o2) return -1;
        //    if (o1 > o2) return 1;
        //    if (p1 < p2) return -1;
        //    if (p1 > p2) return 1;

        //    return 0;
        //}); 

        $scope.PnProduct.Pager.TotalItems = $scope.objOutput.OutputSaleDetails.length;
        $scope.objOutput.DiscountFromOrder = 0;
        $scope.objOutput.DiscountFromCustomer = 0;
        $scope.objOutput.TotalPriceAmount = 0;
        $scope.objOutput.TotalQuantity = 0;//tính lại sum trên lưới vì app sca ko sum sản phẩm phí giao hàng
        $scope.objOutput.OutputSaleDetails.forEach((x) => {
            $scope.objOutput.TotalQuantity += x.Quantity;
            $scope.objOutput.TotalPriceAmount += x.PriceAmount;
            $scope.objOutput.DiscountFromOrder += x.DiscountFromOrder * x.Quantity;
            $scope.objOutput.DiscountFromCustomer += x.DiscountFromCustomer * x.Quantity;
        })
    }, 100);
    //#endregion
     
    //#region paging
    $scope.PnProduct.Search = function (intPage) {
        intPage = !intPage ? 1 : intPage;
        $scope.PnProduct.Pager.CurrentPage = intPage;
    };
    //#endregion

    //#region btnXuatChiTiet
    $scope.btnXuatChiTiet = function () {
        //tham so truyen ve
        UtilJS.Files.Download({
            url: "/OutputVoucher/OSEditExport",
            method: "POST",
            data: { ID: $scope.objOutput.OSID },
            beforsend: function () {
                $timeout(function () { UtilJS.Loading.Show(); });
            },
            success: function (result) {
                $timeout(function () { UtilJS.Loading.Hide(); });
                if (result == undefined) return;
                if (result.objCodeStep.Status != jAlert.Status.Success) {
                    jAlert.Notify(result.objCodeStep);
                    return;
                }
            }
        });
        return true;
    }
    //#endregion

    //#region sum footer 
    //$scope.$watch('PnProduct.Lst', function (n, o) {
    //    $scope.PnProduct.Lst.forEach(function (item) {
    //        //$scope.objOutput.TotalQuantity += item.Quantity;//tong so luong
    //        //$scope.objOutput.TotalTaxAmount += item.TaxAmount;//tong tien thue
    //        //$scope.objOutput.TotalAmount += item.PriceAmount;//tong tien TT
    //        $scope.objOutput.TotalDiscount = $scope.objOutput.TotalAmount - $scope.objOutput.TotalTaxAmount;//tong tien hang
    //    });
    //}, true);
    //#endregion
}
OutputSalesDetailController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory", "$localstorage"];
addController("OutputSalesDetailController", OutputSalesDetailController);