var ReturnExceptionDetailController = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory, $localstorage, ApiHelper) {
    //#region declare variable
    $scope.ReturnException = {
        btnSearch: {},
        btnConfirm: {}
    };
    $scope.objOutput = {};
    $scope.objOutput.IsReturnException = true;// gáng giá trị khởi tạo là đã xác nhận rồi
    $scope.PnProduct = { Lst: [], Pager: { TotalItems: 0, PageSize: 10, CurrentPage: 1 } };
    //#endregion

    //#region paging
    $scope.PnProduct.Search = function (intPage) {
        intPage = !intPage ? 1 : intPage;
        $scope.PnProduct.Pager.CurrentPage = intPage;
    };
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

    $scope.ReturnException.btnSearch.Onclick = function () {
        //validate
        if (!$scope.ReturnException.txtSearch) {
            jAlert.Warning("Vui lòng nhập mã phiếu xuất", "Thông báo");
            return;
        }
        let OutputSaleID = $scope.ReturnException.txtSearch;
        UtilJS.Loading.Show();
        //let strApiEndPoint = ApiEndPoint.OutputSalesResource + 'ReadByID?OutputSaleID=' + OutputSaleID;
        //ApiHelper.GetMethod(strApiEndPoint)
        //    .then(function (response) {
        //        $scope.objOutput = response.Data;
        //        $scope.objOutput.OutputTypeID = $scope.objOutput.OutputTypeID.toString();
        //        $scope.objOutput.PaymentTypeID = $scope.objOutput.PaymentTypeID == null ? "-1" : $scope.objOutput.PaymentTypeID.toString();
        //        $scope.PnProduct.Lst = $scope.objOutput.OutputSaleDetails;
        //        $scope.PnProduct.Lst.filter((x) => {
        //            let ProductName1 = x.ProductName.substring(0, 1).normalize();
        //            ProductName1 = ProductName1.toLowerCase();
        //            x.ProductName1 = UtilJS.String.RemoveUnicode(ProductName1);
        //        });
        //        //**** Định confirm k cần sort ****//
        //        $scope.PnProduct.Lst = _($scope.PnProduct.Lst).chain()
        //            .sortBy(function (patient) {
        //                return patient.CreatedDate;
        //            }).value();
        //        $scope.PnProduct.Pager.TotalItems = $scope.objOutput.OutputSaleDetails.length;
        //        $scope.objOutput.DiscountFromOrder = 0;
        //        $scope.objOutput.DiscountFromCustomer = 0;
        //        $scope.objOutput.TotalPriceAmount = 0;
        //        $scope.objOutput.TotalQuantity = 0;//tính lại sum trên lưới vì app sca ko sum sản phẩm phí giao hàng
        //        $scope.objOutput.OutputSaleDetails.forEach((x) => {
        //            $scope.objOutput.TotalQuantity += x.Quantity;
        //            $scope.objOutput.TotalPriceAmount += x.PriceAmount;
        //            $scope.objOutput.DiscountFromOrder += x.DiscountFromOrder * x.Quantity;
        //            $scope.objOutput.DiscountFromCustomer += x.DiscountFromCustomer * x.Quantity;
        //        });
        //        UtilJS.Loading.Hide();
        //    })
        //    .catch(function (response) {
        //        jAlert.Notify(response);
        //        $scope.PnProduct.Lst = [];
        //        $scope.objOutput = {};
        //        $scope.objOutput.IsReturnException = true;// gáng giá trị khởi tạo là đã xác nhận rồi
        //        UtilJS.Loading.Hide();
        //    });
        CommonFactory.PostDataAjax("/OutputSales/ReadByID", { OutputSaleID: OutputSaleID },
            function (beforeSend) { },
            function (response) {
                $timeout(function () {
                    UtilJS.Loading.Hide();
                    if (response.objCodeStep.Status != jAlert.Status.Success) {
                        jAlert.Notify(response.objCodeStep);
                        $scope.PnProduct.Lst = [];
                        $scope.objOutput = {};
                        $scope.objOutput.IsReturnException = true;// gáng giá trị khởi tạo là đã xác nhận rồi
                        return;
                    } else {
                        $scope.objOutput = response.Data;
                        $scope.objOutput.OutputTypeID = $scope.objOutput.OutputTypeID.toString();
                        $scope.objOutput.PaymentTypeID = $scope.objOutput.PaymentTypeID == null ? "-1" : $scope.objOutput.PaymentTypeID.toString();
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
                        });
                    }
                });
            },
            function (error) {
                UtilJS.Loading.Hide();
            }
        );
    };

    $scope.ReturnException.btnConfirm.Onclick = function () {
        //validate
        if (!$scope.objOutput.OSID) {
            jAlert.Warning("Mã phiếu xuất không đúng", "Thông báo");
            return;
        }
        let OSID = $scope.objOutput.OSID;
        UtilJS.Loading.Show();
        //let strApiEndPoint = ApiEndPoint.OutputSalesResource + 'ReturnException?OSID=' + OSID;
        //ApiHelper.PutMethod(strApiEndPoint)
        //    .then(function (response) {
        //        $scope.objOutput.IsReturnException = true;// gáng giá trị khởi tạo là đã xác nhận rồi
        //        jAlert.Success("Xác nhận thành công");
        //        UtilJS.Loading.Hide();
        //    })
        //    .catch(function (response) {
        //        jAlert.Notify(response);
        //        UtilJS.Loading.Hide();
        //    });
        CommonFactory.PostDataAjax("/OutputSales/ReturnExceptionAccept", { OSID: OSID },
            function (beforeSend) { },
            function (response) {
                $timeout(function () {
                    UtilJS.Loading.Hide();
                    if (response.objCodeStep.Status != jAlert.Status.Success) {
                        jAlert.Notify(response.objCodeStep);
                        return;
                    } else {
                        $scope.objOutput.IsReturnException = true;// gáng giá trị khởi tạo là đã xác nhận rồi
                        jAlert.Success("Xác nhận thành công");
                        UtilJS.Loading.Hide();
                    }
                });
            },
            function (error) {
                UtilJS.Loading.Hide();
            }
        );
    };

}
ReturnExceptionDetailController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory", "$localstorage", "ApiHelper"];
addController("ReturnExceptionDetailController", ReturnExceptionDetailController);