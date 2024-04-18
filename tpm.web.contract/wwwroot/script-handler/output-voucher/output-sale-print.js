var PrintController = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory) {
    //#region declare variable
    $scope.objData = DataSetting.objOutputSales;
    
    $scope.Sum = {
        sumCustomerDiscount: 0, sumOutputSaleDiscount: 0,
        sumShipping: 0, sumShippingDiscount: 0, sumPrice: 0,
        sumQuantity: 0, sumQuotedPrice:0
    };

    //#endregion
    if ($scope.objData.OutputSaleDetails != null && $scope.objData.OutputSaleDetails.length > 0)
    {
        $scope.objData.OutputSaleDetails.forEach(function (item) {
            if (item.ProductID != "0021010000001" && item.ProductID != "0021010000002" &&
                        item.ProductID != "0021010000003" && item.ProductID != "0021010000004") {
                $scope.Sum.sumPrice += item.QuotedPrice - item.DiscountProduct<0?0:item.Quantity * (item.QuotedPrice - item.DiscountProduct);
            }
            $scope.Sum.sumCustomerDiscount += item.DiscountFromCustomer;
            if (!item.IsDelivery)
            {
                $scope.Sum.sumQuantity += item.Quantity;
                DataSetting.arrCateExceptBonus.forEach(function (item2) {
                    if (item2 == item.CategoryID)
                        $scope.Sum.sumQuotedPrice += item.QuotedPrice;
                });
            }
            else {
                $scope.Sum.sumShipping += item.OriginalDeliveryPrice;
                if (item.OutputTypeID == OutputTypeEnum.XuatKhuyenMai) {
                    $scope.Sum.sumShippingDiscount += item.OriginalDeliveryPrice;
                }
            }
        });
    }
    
    if ($scope.objData.OutputSaleDisCount != null && $scope.objData.OutputSaleDisCount.length > 0)
    {
        $scope.objData.OutputSaleDisCount.forEach(function (item) {
            if (item.DiscountTypeID == 4) {
                $scope.Sum.sumOutputSaleDiscount += item.DiscountValue;
            }
        });
    }
    //$scope.objData.OrderPoint = $scope.objData.OrderPoint == null ? (($scope.objData.TotalAmount - $scope.Sum.sumQuotedPrice) * DataSetting.RedAntPercent/100) : $scope.objData.OrderPoint;

    //var Lst = _.sortBy(DataSetting.objOutputSales.OutputSaleDetails, "PID");
}
PrintController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory"];
addController("PrintController", PrintController);